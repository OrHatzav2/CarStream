namespace CarImport.Models;
public class SearchFields
{
    public required string _id { get; set; }
    public required AggregatedRecord data { get; set; }
}

public class AggregatedRecord
{
    public List<string> חברה { get; set; } = [];
    public List<string> יבואן { get; set; } = [];
    public List<string> מספר_דגם { get; set; } =[];
    public List<string> דגם { get; set; } = [];
    public List<string> סוג_רכב { get; set; } = [];
    public List<string> ארץ_תוצרת { get; set; } = [];
}
