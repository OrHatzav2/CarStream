namespace CarImport.Models
{
    public class MongoDBSettings
    {
        public string ConnectionURI { get; init; } = null!;
        public string DatabaseName { get; init; } = null!;
        public CollectionsSettings Collections { get; init; } = new CollectionsSettings();
    }

    public class CollectionsSettings
    {
        public string ImportsRecord { get; init; } = null!;
        public string FieldsRecord { get; init; } = null!;
    }
}
