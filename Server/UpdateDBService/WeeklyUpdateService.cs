using MongoDB.Driver;
using MongoDB.Bson;
using System.Net.Http;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Text;
using System.Collections.Generic;
using CarImport.Models;

namespace CarImport.Services;

public class WeeklyUpdateService
{
    private readonly IMongoCollection<ImportsRecord> _importsCollection;
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl = "https://data.gov.il/api/3/action/datastore_search?resource_id=39f455bf-6db0-4926-859d-017f34eacbcb";
    private readonly List<FixedData> _fixedData;

    public WeeklyUpdateService(IMongoClient mongoClient, string databaseName, string collectionName, List<FixedData> fixedData)
    {
        _importsCollection = mongoClient.GetDatabase(databaseName).GetCollection<ImportsRecord>(collectionName);
        _httpClient = new HttpClient();
        _fixedData = fixedData;

        var timer = new System.Timers.Timer(604800000); // Set to 1 week (in milliseconds)
        timer.Elapsed += async (sender, e) => await PerformWeeklyUpdate();
        timer.AutoReset = true;
        timer.Start();
    }

    private async Task PerformWeeklyUpdate()
    {
        try
        {
            // Step 1: Get the current highest `_id` in the collection
            var latestRecord = await _importsCollection.Find(Builders<ImportsRecord>.Filter.Empty)
                .SortByDescending(r => r._id)
                .Limit(1)
                .FirstOrDefaultAsync();

            var currentMaxId = latestRecord?._id ?? 0;

            // Step 2: Get new records from the external API
            var newRecords = await FetchNewRecordsAsync(currentMaxId);

            // Step 3: Transform records
            var transformedRecords = TransformRecords(newRecords, _fixedData);

            // Step 4: Insert transformed records
            if (transformedRecords.Any())
            {
                await _importsCollection.InsertManyAsync(transformedRecords);

                // Step 5: Maintain 32,000 records by removing oldest entries
                var excessRecords = await _importsCollection.CountDocumentsAsync(FilterDefinition<ImportsRecord>.Empty) - 32000;
                if (excessRecords > 0)
                {
                    var idsToDelete = await _importsCollection.Find(FilterDefinition<ImportsRecord>.Empty)
                        .SortBy(r => r._id)
                        .Limit((int)excessRecords)
                        .Project(r => r._id)
                    .ToListAsync();

                    var deleteFilter = Builders<ImportsRecord>.Filter.In(r => r._id, idsToDelete);
                    await _importsCollection.DeleteManyAsync(deleteFilter);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during weekly update: {ex.Message}");
        }
    }

    private async Task<List<JObject>> FetchNewRecordsAsync(long currentMaxId)
    {
        var response = await _httpClient.GetStringAsync($"{_apiUrl}&sort=_id:desc&limit=1000");
        var jsonResponse = JObject.Parse(response);
        var records = jsonResponse["result"]["records"]
            .Where(r => (long)r["_id"] > currentMaxId)
            .Select(r => (JObject)r)  // Cast each record to JObject
            .ToList();

        return records;
    }

    private static readonly Dictionary<string, string> translationMap = new()
    {
        { "semel_yevuan", "סמל_יבואן" },
        { "shem_yevuan", "יבואן" },
        { "sug_degem", "סוג_רכב" },
        { "tozeret_cd", "קוד_תוצרת" },
        { "tozeret_nm", "חברה" },
        { "degem_cd", "קוד_דגם" },
        { "degem_nm", "מספר_דגם" },
        { "shnat_yitzur", "שנת_ייצור" },
        { "mehir", "מחיר" },
        { "kinuy_mishari", "דגם" },
        { "eretz_tozeret", "ארץ_תוצרת" }
    };

    private List<ImportsRecord> TransformRecords(List<JObject> records, List<FixedData> fixedData)
    {
        var fixedDataMap = fixedData.ToDictionary(fd => fd.כיתוב_מקורי, fd => fd);
        var transformedRecords = new List<ImportsRecord>();

        foreach (var record in records)
        {
            var translatedRecord = new Dictionary<string, object>();

            // Translate each key based on translationMap
            foreach (var (englishKey, value) in record)
            {
                var hebrewKey = translationMap.ContainsKey(englishKey) ? translationMap[englishKey] : englishKey;
                translatedRecord[hebrewKey] = value;
            }

            // Apply additional transformations
            string? originalName = translatedRecord.ContainsKey("חברה") ? translatedRecord["חברה"].ToString() : "";

            if (fixedDataMap.TryGetValue(originalName, out var matchedData))
            {
                translatedRecord["ארץ_תוצרת"] = matchedData.ארץ_תוצרת;
                translatedRecord["חברה"] = matchedData.חברה;
            }

            if (originalName.Contains(" ארה\"ב") || originalName.Contains("-ארה\"ב"))
            {
                translatedRecord["חברה"] = originalName.Replace(" ארה\"ב", "").Replace("-ארה\"ב", "");
                translatedRecord["ארץ_תוצרת"] = "ארצות הברית";
            }
            else if (originalName.Contains(" סין"))
            {
                translatedRecord["חברה"] = originalName.Replace(" סין", "");
                translatedRecord["ארץ_תוצרת"] = "סין";
            }

            if (!translatedRecord.ContainsKey("ארץ_תוצרת") || string.IsNullOrEmpty(translatedRecord["ארץ_תוצרת"]?.ToString()))
            {
                translatedRecord["ארץ_תוצרת"] = "רשומה ללא ארץ";
            }

            translatedRecord["סוג_רכב"] = translatedRecord.ContainsKey("סוג_רכב") && translatedRecord["סוג_רכב"].ToString() == "P" ? "פרטי" : "מסחרי";

            if (translatedRecord["חברה"]?.ToString() == "מרצדס")
            {
                translatedRecord["חברה"] = "מרצדס בנץ";
            }

            // Convert translatedRecord to ImportRecord model and add to list
            var importRecord = JsonConvert.DeserializeObject<ImportsRecord>(JsonConvert.SerializeObject(translatedRecord));
            transformedRecords.Add(importRecord);
        }

        return transformedRecords;
    }

    // Model for FixedData (from fixed.json)
    public class FixedData
{
    public string כיתוב_מקורי { get; set; }
    public string ארץ_תוצרת { get; set; }
    public string חברה { get; set; }
}
}
