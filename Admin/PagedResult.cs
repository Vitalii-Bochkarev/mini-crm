namespace MyProject2.Admin;

public sealed class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; }
    public int TotalCount { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalPages => TotalCount <= 0 || PageSize <= 0
        ? 0
        : 1 + (TotalCount - 1) / PageSize;
    public bool HasNext => Page >= 1 && Page < TotalPages;
    public bool HasPrevious => TotalPages > 0 && Page > 1;

    public PagedResult(IReadOnlyCollection<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
    }
}

