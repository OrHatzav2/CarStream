namespace CarImport.Services;
public static class EnumerableExtensions
{
    public static IEnumerable<List<T>> GetChunks<T>(this IEnumerable<T> source, int chunkSize)
    {
        var chunk = new List<T>(chunkSize);
        foreach (var item in source)
        {
            chunk.Add(item);
            if (chunk.Count == chunkSize)
            {
                yield return chunk;
                chunk = new List<T>(chunkSize);
            }
        }
        if (chunk.Any())
        {
            yield return chunk;
        }
    }
}
