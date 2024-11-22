using CarImport.Models;

namespace CarImport.Services;

public static class Logic
{
    public static bool FilterRecord(ImportsRecord record, int? fromYear, int? toYear, decimal? minPrice, decimal? maxPrice)
    {
        bool validYear = !fromYear.HasValue ||
                    (toYear.HasValue ? record.שנת_ייצור >= fromYear && record.שנת_ייצור <= toYear : record.שנת_ייצור == fromYear);
        bool validPrice = !minPrice.HasValue ||
                    (maxPrice.HasValue ? record.מחיר >= minPrice && record.מחיר <= maxPrice : record.מחיר == minPrice);
        return validYear && validPrice;
    }

    public static void IncrementCount(Dictionary<string, int> dict, string key)
    {
        if (!dict.ContainsKey(key)) dict[key] = 0;
        dict[key]++;
    }

    public static object BuildYevuan(List<ImportsRecord> data, string importerName)
    {
        return new
        {
            importer = importerName,
            records_per_year = data.GroupBy(r => r.שנת_ייצור)
                                   .ToDictionary(g => g.Key, g => g.Count()),

            unique_companies = data
            .GroupBy(r => r.חברה)
            .ToDictionary(
                g => g.Key,
                g => new Dictionary<string, int>(
                    g.GroupBy(r => r.ארץ_תוצרת)
                    .ToDictionary(cg => cg.Key, cg => cg.Count())
                )
                {
                    { "total", g.Count() }
                }
            ),

            price_range_per_model = data.GroupBy(r => r.דגם)
                                        .ToDictionary(g => g.Key, g => new
                                        {
                                            min = g.Min(r => r.מחיר),
                                            max = g.Max(r => r.מחיר)
                                        })
        };
    }

    public static object BuildTozeret(List<ImportsRecord> data, string value)
    {
        var model_info = data
                .GroupBy(r => r.מספר_דגם)
                .ToDictionary(
                    g => g.Key,
                    g => new
                    {
                        g.First().דגם,
                        g.First().סוג_רכב,
                        price_range = new
                        {
                            min = g.Min(r => r.מחיר),
                            max = g.Max(r => r.מחיר)
                        },
                        record_count = g.Count(),
                        importers = g.GroupBy(r => r.יבואן)
                                    .ToDictionary(ig => ig.Key, ig => ig.Count())
                    }
                );
        return new
        {
            manufacturer = value,
            records_per_year = data
                .GroupBy(r => r.שנת_ייצור)
                .ToDictionary(
                    g => g.Key,
                    g => new Dictionary<string, int>(
                        g.GroupBy(r => r.ארץ_תוצרת)
                        .ToDictionary(cg => cg.Key, cg => cg.Count())
                    )
                    {
                        { "total", g.Count() }
                    }
                ),
            importers = data
                .GroupBy(r => r.יבואן)
                .ToDictionary(
                    g => g.Key,
                    g => new Dictionary<string, int>(
                        g.GroupBy(r => r.ארץ_תוצרת)
                        .ToDictionary(cg => cg.Key, cg => cg.Count())
                    )
                    {
                        { "total", g.Count() }
                    }
                ),
            model_info,
            total_models = model_info.Count
        };
    }

    public static Dictionary<string, int> CountOccurrences(IEnumerable<string> items)
    {
        return items
            .GroupBy(x => x)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .ToDictionary(g => g.Key, g => g.Count());
    }
    public static Dictionary<string, int> CountOccurrencesByKey(IEnumerable<ImportsRecord> records)
    {
        return records
            .GroupBy(r => r.דגם)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .ToDictionary(
                g => $"{g.First().חברה}_{g.Key}",
                g => g.Count()
            );
    }
}
