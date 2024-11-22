using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using CarImport.Models;
using CarImport.Services;
using ClosedXML.Excel;
using System.Data;

namespace CarImport.Controllers;

[ApiController]
[Route("[controller]")]
public class ImportsController(MongoDBService dbService) : ControllerBase
{
    [HttpGet("/analysis/{key}={value}")]
    public async Task<IActionResult> GetAnalysis(string key, string value)
    {
        if (string.IsNullOrEmpty(key)) {
            return BadRequest(new { error = "Please provide a filter." });
        }
        var data = await dbService.GetAnalysisAsync(key, value);
        if (data.Count == 0)
            return NotFound(new { message = "No records found for the provided filter." });

        var analysis = key.Equals("יבואן") ? Logic.BuildYevuan(data, value) : Logic.BuildTozeret(data, value);
        return Ok(analysis);
    }

    [HttpGet("/search_key")]
    public async Task<IActionResult> GetSummaryData(
       [FromQuery] string key)
    {
        var result = await dbService.GetSearchKeyAsync(key);
        if (result is null)
            return NotFound(new { error = "No data found." });

        return Ok(result);
    }

   [HttpGet("/search_fields")]
    public async Task<IActionResult> GetSearchFields()
    {
        var result = await dbService.GetSearchFieldsAsync();
        if (result is null)
            return NotFound(new { error = "No data found." });

        return Ok(result);
    }

    [HttpGet("/summary_data")]
    public async Task<IActionResult> GetSummaryData(
        [FromQuery] string? יבואן,
        [FromQuery] string? סוג_רכב,
        [FromQuery] string? חברה,
        [FromQuery] string? ארץ_תוצרת,
        [FromQuery] string? מספר_דגם,
        [FromQuery] int? משנת_ייצור,
        [FromQuery] int? עד_שנת_ייצור,
        [FromQuery] decimal? ממחיר,
        [FromQuery] decimal? עד_מחיר,
        [FromQuery] string? דגם)
    {
        try
        {
            var filter = new Dictionary<string, object>();
            if (!string.IsNullOrEmpty(יבואן)) filter.Add("יבואן", יבואן);
            if (!string.IsNullOrEmpty(סוג_רכב)) filter.Add("סוג_רכב", סוג_רכב);
            if (!string.IsNullOrEmpty(חברה)) filter.Add("חברה", חברה);
            if (!string.IsNullOrEmpty(ארץ_תוצרת)) filter.Add("ארץ_תוצרת", ארץ_תוצרת);
            if (!string.IsNullOrEmpty(מספר_דגם)) filter.Add("מספר_דגם", מספר_דגם);
            if (!string.IsNullOrEmpty(דגם)) filter.Add("דגם", דגם);

            var data = await dbService.GetAllDataAsync(filter);
            var filteredData = data.Where(record =>
                Logic.FilterRecord(record, משנת_ייצור, עד_שנת_ייצור, ממחיר, עד_מחיר)).ToList();

            if (!filteredData.Any())
                return NotFound(new { message = "No records found for the provided filter." });

            if (משנת_ייצור.HasValue) filter.Add("משנת_ייצור", משנת_ייצור.Value);
            if (עד_שנת_ייצור.HasValue) filter.Add("עד_שנת_ייצור", עד_שנת_ייצור.Value);
            if (ממחיר.HasValue) filter.Add("ממחיר", ממחיר.Value);
            if (עד_מחיר.HasValue) filter.Add("עד_מחיר", עד_מחיר.Value);

            var counts = new Dictionary<string, Dictionary<string, int>>
            {
                ["יבואן"] = [],
                ["סוג_רכב"] = [],
                ["חברה"] = [],
                ["מספר_דגם"] = [],
                ["ארץ_תוצרת"] = [],
                ["דגם"] = []
            };

            foreach (var record in filteredData)
            {
                if (string.IsNullOrEmpty(יבואן)) Logic.IncrementCount(counts["יבואן"], record.יבואן);
                if (string.IsNullOrEmpty(סוג_רכב)) Logic.IncrementCount(counts["סוג_רכב"], record.סוג_רכב);
                if (string.IsNullOrEmpty(חברה)) Logic.IncrementCount(counts["חברה"], record.חברה);
                if (string.IsNullOrEmpty(מספר_דגם)) Logic.IncrementCount(counts["מספר_דגם"], record.מספר_דגם);
                if (string.IsNullOrEmpty(ארץ_תוצרת)) Logic.IncrementCount(counts["ארץ_תוצרת"], record.ארץ_תוצרת);
                if (string.IsNullOrEmpty(דגם)) Logic.IncrementCount(counts["דגם"], record.דגם);
            }

            return Ok(new
            {
                total_filtered = filteredData.Count,
                analysis = counts,
                filters = filter
            });
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in summary_data: {ex}");
            return StatusCode(500, new { error = "An error occurred while processing your request." });
        }
    }


    [HttpGet("/chunked_data")]
    public async Task<IActionResult> GetChunkedData(
        [FromQuery] int chunkNumber,
        [FromQuery] string? יבואן,
        [FromQuery] string? סוג_רכב,
        [FromQuery] string? חברה,
        [FromQuery] string? ארץ_תוצרת,
        [FromQuery] string? מספר_דגם,
        [FromQuery] int? משנת_ייצור,
        [FromQuery] int? עד_שנת_ייצור,
        [FromQuery] decimal? ממחיר,
        [FromQuery] decimal? עד_מחיר,
        [FromQuery] string? דגם,
        [FromQuery] string? sortedBy = null,
        [FromQuery] string? sortDirection = null)
    {
        try
        {
            var filter = new Dictionary<string, object>();
            if (!string.IsNullOrEmpty(יבואן)) filter.Add("יבואן", יבואן);
            if (!string.IsNullOrEmpty(סוג_רכב)) filter.Add("סוג_רכב", סוג_רכב);
            if (!string.IsNullOrEmpty(חברה)) filter.Add("חברה", חברה);
            if (!string.IsNullOrEmpty(ארץ_תוצרת)) filter.Add("ארץ_תוצרת", ארץ_תוצרת);
            if (!string.IsNullOrEmpty(מספר_דגם)) filter.Add("מספר_דגם", מספר_דגם);
            if (!string.IsNullOrEmpty(דגם)) filter.Add("דגם", דגם);

            var data = await dbService.GetAllDataAsync(filter);
            var filteredData = data.Where(record =>
                Logic.FilterRecord(record, משנת_ייצור, עד_שנת_ייצור, ממחיר, עד_מחיר)).ToList();

            if (sortedBy != null)
            {
                var property = typeof(ImportsRecord).GetProperty(sortedBy);
                if (property != null)
                {
                    filteredData = sortDirection == "desc"
                        ? filteredData.OrderByDescending(r => property.GetValue(r)).ToList()
                        : filteredData.OrderBy(r => property.GetValue(r)).ToList();
                }
            }

            const int chunkSize = 20;
            var chunk = filteredData.Skip(chunkSize * (chunkNumber - 1)).Take(chunkSize).ToList();

            if (!chunk.Any())
                return NotFound(new { message = "No records found for the specified chunk." });

            return Ok(new { records = chunk, amount_records = filteredData.Count});
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in chunked_data: {ex}");
            return StatusCode(500, new { error = "An error occurred while processing your request." });
        }
    }

    [HttpGet("/get_excel")]
    public async Task<IActionResult> GetExcel(
        [FromQuery] string? יבואן,
        [FromQuery] string? סוג_רכב,
        [FromQuery] string? חברה,
        [FromQuery] string? ארץ_תוצרת,
        [FromQuery] string? מספר_דגם,
        [FromQuery] int? משנת_ייצור,
        [FromQuery] int? עד_שנת_ייצור,
        [FromQuery] decimal? ממחיר,
        [FromQuery] decimal? עד_מחיר,
        [FromQuery] string? דגם)
    {
        try
        {
            var filter = new Dictionary<string, object>();
            if (!string.IsNullOrEmpty(יבואן)) filter.Add("יבואן", יבואן);
            if (!string.IsNullOrEmpty(סוג_רכב)) filter.Add("סוג_רכב", סוג_רכב);
            if (!string.IsNullOrEmpty(חברה)) filter.Add("חברה", חברה);
            if (!string.IsNullOrEmpty(ארץ_תוצרת)) filter.Add("ארץ_תוצרת", ארץ_תוצרת);
            if (!string.IsNullOrEmpty(מספר_דגם)) filter.Add("מספר_דגם", מספר_דגם);
            if (!string.IsNullOrEmpty(דגם)) filter.Add("דגם", דגם);

            var data = await dbService.GetAllDataAsync(filter);
            var filteredData = data.Where(record =>
                Logic.FilterRecord(record, משנת_ייצור, עד_שנת_ייצור, ממחיר, עד_מחיר)).ToList();

            if (filteredData.Count == 0)
                return NotFound(new { message = "No records found for the provided filter." });

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Filtered Data");

            var properties = typeof(ImportsRecord).GetProperties();
            for (int i = 0; i < properties.Length; i++)
            {
                worksheet.Cell(1, i + 1).Value = properties[i].Name.Replace("_", " ");
            }

            for (int row = 0; row < filteredData.Count; row++)
            {
                for (int col = 0; col < properties.Length; col++)
                {
                    var value = properties[col].GetValue(data[row])?.ToString();
                    worksheet.Cell(row + 2, col + 1).Value = value; 
                }
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "FilteredData.xlsx"
            );

        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error generating Excel: {ex}");
            return StatusCode(500, new { error = "An error occurred while processing your request." });
        }
    }

    [HttpGet("/data_comparison")]
    public async Task<IActionResult> GetDataComparisonAsync()
    {
        try
        {
            var allData = await dbService.GetAllDataAsync([]);

            var latestYear = allData.Max(r => r.שנת_ייצור);

            var modelOverall = Logic.CountOccurrencesByKey(allData).Take(10).ToDictionary(kv => kv.Key, kv => kv.Value);
            var modelLastYear = Logic.CountOccurrencesByKey(
                allData.Where(r => r.שנת_ייצור == latestYear)
            ).ToDictionary(kv => kv.Key, kv => kv.Value);

            var importerOverall = Logic.CountOccurrences(allData.Select(r => r.יבואן));
            var importerLastYear = Logic.CountOccurrences(allData.Where(r => r.שנת_ייצור == latestYear).Select(r => r.יבואן));

            var companyOverall = Logic.CountOccurrences(allData.Select(r => r.חברה));
            var companyLastYear = Logic.CountOccurrences(allData.Where(r => r.שנת_ייצור == latestYear).Select(r => r.חברה));

            var modelTypeCount = Logic.CountOccurrences(allData.Select(r => r.סוג_רכב));

            var result = new
            {
                יבואן = new
                {
                    סך_הכל = importerOverall,
                    שנה_נוכחית = importerLastYear
                },
                חברה = new
                {
                    סך_הכל = companyOverall,
                    שנה_נוכחית = companyLastYear
                },
                דגם = new
                {
                    סך_הכל = modelOverall,
                    שנה_נוכחית = modelLastYear
                },
                סוג_רכב = modelTypeCount
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in data comparison: {ex}");
            return StatusCode(500, new { error = "An error occurred while processing your request." });
        }
    }

}
