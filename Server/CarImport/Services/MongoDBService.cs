using CarImport.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;

namespace CarImport.Services;

public class MongoDBService {
    private readonly IMongoCollection<ImportsRecord> _importsCollection;
    private readonly IMongoCollection<SearchFields> _searchFieldsCollection;

    public MongoDBService(IOptions<MongoDBSettings> mongoDBSettings) {
        MongoClient client = new(mongoDBSettings.Value.ConnectionURI);
        IMongoDatabase database = client.GetDatabase(mongoDBSettings.Value.DatabaseName);
        _importsCollection = database.GetCollection<ImportsRecord>(mongoDBSettings.Value.Collections.ImportsRecord);
        _searchFieldsCollection = database.GetCollection<SearchFields>(mongoDBSettings.Value.Collections.FieldsRecord);
    }

    public async Task<List<ImportsRecord>> GetAnalysisAsync(string key, string value) {
        return await _importsCollection.Find(new BsonDocument {{key, value}}).ToListAsync();
    }
    public async Task<SearchFields> GetSearchFieldsAsync() {
        return await _searchFieldsCollection.Find(new BsonDocument { { "_id", "aggregated_data" } }).FirstOrDefaultAsync();
    }
    public async Task<List<object>> GetSearchKeyAsync(string key)
    {
        var result = await _searchFieldsCollection
            .Find(x => x._id == "aggregated_data")
            .FirstOrDefaultAsync();

        if (result == null || result.data == null) return new List<object>();

        var property = typeof(AggregatedRecord).GetProperty(key);
        if (property == null) return new List<object>();

        var value = property.GetValue(result.data);
        return value is IEnumerable<object> enumerable ? enumerable.ToList() : new List<object>();
    }

    public async Task<List<ImportsRecord>> GetAllDataAsync(Dictionary<string, object> filter) {
        return await _importsCollection.Find(new BsonDocument(filter)).ToListAsync();
    }

}
