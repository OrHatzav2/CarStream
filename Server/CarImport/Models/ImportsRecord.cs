using MongoDB.Bson.Serialization.Attributes;

namespace CarImport.Models;

[BsonIgnoreExtraElements]
public class ImportsRecord
{
    public  int _id { get; set; }

    //TODO:
    [BsonElement("סמל_יבואן")]
    public int סמל_יבואן { get; set; }
    public required string יבואן { get; set; }
    public required string סוג_רכב { get; set; }
    public int קוד_תוצרת { get; set; }
    public required string חברה { get; set; }
    public int קוד_דגם { get; set; }
    public required string מספר_דגם { get; set; }
    public int שנת_ייצור { get; set;}
    public int מחיר { get; set; }
    public required string דגם { get; set; }
    public required string ארץ_תוצרת { get; set; }
}
