using System.Net;
using System.Net.Http.Json;

namespace MyProject2.Tests;

[Collection(PostgreSqlIntegrationCollection.Name)]
public sealed class PagingIntegrationTests(PostgreSqlIntegrationFixture fixture)
{
    [Fact]
    public async Task Restaurants_Search_ReturnsOnlyMatches_AndEmptyResultMetadata()
    {
        var marker = UniqueMarker("restaurant_search");
        var first = await CreateRestaurantAsync($"{marker}_First", "Search City");
        var second = await CreateRestaurantAsync($"{marker}_Second", "Search City");
        await CreateRestaurantAsync($"unrelated_{UniqueSuffix()}", "Other City");

        var result = await GetPageAsync<TestRestaurant>(
            $"/restaurants?search={marker}&page=1&pageSize=10&sortBy=name&sortDirection=asc");

        Assert.Equal([first.Id, second.Id], result.Items.Select(item => item.Id));
        AssertMetadata(result, totalCount: 2, page: 1, pageSize: 10, totalPages: 1,
            hasNext: false, hasPrevious: false);

        var empty = await GetPageAsync<TestRestaurant>(
            $"/restaurants?search={UniqueMarker("missing")}&page=1&pageSize=3");

        Assert.Empty(empty.Items);
        AssertMetadata(empty, totalCount: 0, page: 1, pageSize: 3, totalPages: 0,
            hasNext: false, hasPrevious: false);
    }

    [Fact]
    public async Task Restaurants_NameSorting_WorksInBothDirections()
    {
        var marker = UniqueMarker("restaurant_sort");
        var bravo = await CreateRestaurantAsync($"{marker}_Bravo", "Sort City");
        var alpha = await CreateRestaurantAsync($"{marker}_Alpha", "Sort City");
        var charlie = await CreateRestaurantAsync($"{marker}_Charlie", "Sort City");

        var ascending = await GetPageAsync<TestRestaurant>(
            $"/restaurants?search={marker}&page=1&pageSize=10&sortBy=name&sortDirection=asc");
        var descending = await GetPageAsync<TestRestaurant>(
            $"/restaurants?search={marker}&page=1&pageSize=10&sortBy=name&sortDirection=desc");

        Assert.Equal([alpha.Id, bravo.Id, charlie.Id], ascending.Items.Select(item => item.Id));
        Assert.Equal([charlie.Id, bravo.Id, alpha.Id], descending.Items.Select(item => item.Id));
    }

    [Fact]
    public async Task Restaurants_Pagination_ReturnsStableNonOverlappingPagesAndMetadata()
    {
        var marker = UniqueMarker("restaurant_page");
        var created = new[]
        {
            await CreateRestaurantAsync($"{marker}_Alpha", "Page City"),
            await CreateRestaurantAsync($"{marker}_Bravo", "Page City"),
            await CreateRestaurantAsync($"{marker}_Charlie", "Page City"),
            await CreateRestaurantAsync($"{marker}_Delta", "Page City"),
            await CreateRestaurantAsync($"{marker}_Echo", "Page City")
        };

        var first = await GetRestaurantPageAsync(marker, page: 1, pageSize: 2);
        var second = await GetRestaurantPageAsync(marker, page: 2, pageSize: 2);
        var last = await GetRestaurantPageAsync(marker, page: 3, pageSize: 2);
        var secondAgain = await GetRestaurantPageAsync(marker, page: 2, pageSize: 2);

        Assert.Equal(created[..2].Select(item => item.Id), first.Items.Select(item => item.Id));
        Assert.Equal(created[2..4].Select(item => item.Id), second.Items.Select(item => item.Id));
        Assert.Equal(created[4..].Select(item => item.Id), last.Items.Select(item => item.Id));
        AssertMetadata(first, 5, 1, 2, 3, hasNext: true, hasPrevious: false);
        AssertMetadata(second, 5, 2, 2, 3, hasNext: true, hasPrevious: true);
        AssertMetadata(last, 5, 3, 2, 3, hasNext: false, hasPrevious: true);
        Assert.Empty(first.Items.Select(item => item.Id).Intersect(second.Items.Select(item => item.Id)));
        Assert.Equal(second.Items.Select(item => item.Id), secondAgain.Items.Select(item => item.Id));
    }

    [Fact]
    public async Task Employees_Search_ReturnsOnlyMatches_AndEmptyResultMetadata()
    {
        var marker = UniqueMarker("employee_search");
        var restaurant = await CreateRestaurantAsync($"Host_{UniqueSuffix()}", "Employee City");
        var first = await CreateEmployeeAsync(restaurant.Id, marker, "Alpha", "Tester", 100m);
        var second = await CreateEmployeeAsync(restaurant.Id, "Second", "Bravo", marker, 200m);
        await CreateEmployeeAsync(restaurant.Id, "Unrelated", "Person", "Other", 300m);

        var result = await GetPageAsync<TestEmployee>(
            $"/employees?search={marker}&page=1&pageSize=10&sortBy=lastName&sortDirection=asc");

        Assert.Equal([first.Id, second.Id], result.Items.Select(item => item.Id));
        AssertMetadata(result, 2, 1, 10, 1, hasNext: false, hasPrevious: false);

        var empty = await GetPageAsync<TestEmployee>(
            $"/employees?search={UniqueMarker("missing")}&page=1&pageSize=4");

        Assert.Empty(empty.Items);
        AssertMetadata(empty, 0, 1, 4, 0, hasNext: false, hasPrevious: false);
    }

    [Fact]
    public async Task Employees_LastNameSorting_WorksInBothDirections()
    {
        var marker = UniqueMarker("employee_sort");
        var restaurant = await CreateRestaurantAsync($"Host_{UniqueSuffix()}", "Employee City");
        var bravo = await CreateEmployeeAsync(restaurant.Id, "Test", "Bravo", marker, 200m);
        var alpha = await CreateEmployeeAsync(restaurant.Id, "Test", "Alpha", marker, 100m);
        var charlie = await CreateEmployeeAsync(restaurant.Id, "Test", "Charlie", marker, 300m);

        var ascending = await GetPageAsync<TestEmployee>(
            $"/employees?search={marker}&page=1&pageSize=10&sortBy=lastName&sortDirection=asc");
        var descending = await GetPageAsync<TestEmployee>(
            $"/employees?search={marker}&page=1&pageSize=10&sortBy=lastName&sortDirection=desc");

        Assert.Equal([alpha.Id, bravo.Id, charlie.Id], ascending.Items.Select(item => item.Id));
        Assert.Equal([charlie.Id, bravo.Id, alpha.Id], descending.Items.Select(item => item.Id));
    }

    [Fact]
    public async Task Employees_SalarySorting_WorksInBothDirections()
    {
        var marker = UniqueMarker("employee_salary");
        var restaurant = await CreateRestaurantAsync($"Host_{UniqueSuffix()}", "Employee City");
        var middle = await CreateEmployeeAsync(restaurant.Id, "Test", "Middle", marker, 200.25m);
        var lowest = await CreateEmployeeAsync(restaurant.Id, "Test", "Lowest", marker, 100.50m);
        var highest = await CreateEmployeeAsync(restaurant.Id, "Test", "Highest", marker, 300.75m);

        var ascending = await GetPageAsync<TestEmployee>(
            $"/employees?search={marker}&page=1&pageSize=10&sortBy=salary&sortDirection=asc");
        var descending = await GetPageAsync<TestEmployee>(
            $"/employees?search={marker}&page=1&pageSize=10&sortBy=salary&sortDirection=desc");

        Assert.Equal([lowest.Id, middle.Id, highest.Id], ascending.Items.Select(item => item.Id));
        Assert.Equal([highest.Id, middle.Id, lowest.Id], descending.Items.Select(item => item.Id));
    }

    [Fact]
    public async Task Employees_Pagination_ReturnsStableNonOverlappingPagesAndMetadata()
    {
        var marker = UniqueMarker("employee_page");
        var restaurant = await CreateRestaurantAsync($"Host_{UniqueSuffix()}", "Employee City");
        var created = new[]
        {
            await CreateEmployeeAsync(restaurant.Id, "Test", "Alpha", marker, 100m),
            await CreateEmployeeAsync(restaurant.Id, "Test", "Bravo", marker, 200m),
            await CreateEmployeeAsync(restaurant.Id, "Test", "Charlie", marker, 300m),
            await CreateEmployeeAsync(restaurant.Id, "Test", "Delta", marker, 400m),
            await CreateEmployeeAsync(restaurant.Id, "Test", "Echo", marker, 500m)
        };

        var first = await GetEmployeePageAsync(marker, page: 1, pageSize: 2);
        var second = await GetEmployeePageAsync(marker, page: 2, pageSize: 2);
        var last = await GetEmployeePageAsync(marker, page: 3, pageSize: 2);
        var secondAgain = await GetEmployeePageAsync(marker, page: 2, pageSize: 2);

        Assert.Equal(created[..2].Select(item => item.Id), first.Items.Select(item => item.Id));
        Assert.Equal(created[2..4].Select(item => item.Id), second.Items.Select(item => item.Id));
        Assert.Equal(created[4..].Select(item => item.Id), last.Items.Select(item => item.Id));
        AssertMetadata(first, 5, 1, 2, 3, hasNext: true, hasPrevious: false);
        AssertMetadata(second, 5, 2, 2, 3, hasNext: true, hasPrevious: true);
        AssertMetadata(last, 5, 3, 2, 3, hasNext: false, hasPrevious: true);
        Assert.Empty(first.Items.Select(item => item.Id).Intersect(second.Items.Select(item => item.Id)));
        Assert.Equal(second.Items.Select(item => item.Id), secondAgain.Items.Select(item => item.Id));
    }

    private Task<TestPagedResult<TestRestaurant>> GetRestaurantPageAsync(
        string marker,
        int page,
        int pageSize) =>
        GetPageAsync<TestRestaurant>(
            $"/restaurants?search={marker}&page={page}&pageSize={pageSize}&sortBy=name&sortDirection=asc");

    private Task<TestPagedResult<TestEmployee>> GetEmployeePageAsync(
        string marker,
        int page,
        int pageSize) =>
        GetPageAsync<TestEmployee>(
            $"/employees?search={marker}&page={page}&pageSize={pageSize}&sortBy=lastName&sortDirection=asc");

    private async Task<TestPagedResult<T>> GetPageAsync<T>(string path)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Get,
            path,
            fixture.Administrator.Token);
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<TestPagedResult<T>>();
        return Assert.IsType<TestPagedResult<T>>(result);
    }

    private async Task<TestRestaurant> CreateRestaurantAsync(string name, string city)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Post,
            "/restaurants",
            fixture.Administrator.Token,
            new { name, city, isActive = true });
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var restaurant = await response.Content.ReadFromJsonAsync<TestRestaurant>();
        return Assert.IsType<TestRestaurant>(restaurant);
    }

    private async Task<TestEmployee> CreateEmployeeAsync(
        Guid restaurantId,
        string firstName,
        string lastName,
        string position,
        decimal salary)
    {
        using var request = fixture.CreateAuthorizedRequest(
            HttpMethod.Post,
            "/employees",
            fixture.Administrator.Token,
            new { firstName, lastName, position, salary, isActive = true, restaurantId });
        using var response = await fixture.Client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var employee = await response.Content.ReadFromJsonAsync<TestEmployee>();
        return Assert.IsType<TestEmployee>(employee);
    }

    private static void AssertMetadata<T>(
        TestPagedResult<T> result,
        int totalCount,
        int page,
        int pageSize,
        int totalPages,
        bool hasNext,
        bool hasPrevious)
    {
        Assert.Equal(totalCount, result.TotalCount);
        Assert.Equal(page, result.Page);
        Assert.Equal(pageSize, result.PageSize);
        Assert.Equal(totalPages, result.TotalPages);
        Assert.Equal(hasNext, result.HasNext);
        Assert.Equal(hasPrevious, result.HasPrevious);
    }

    private static string UniqueMarker(string prefix) => $"{prefix}_{UniqueSuffix()}";

    private static string UniqueSuffix() => Guid.NewGuid().ToString("N")[..10];
}

public sealed record TestPagedResult<T>(
    T[] Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages,
    bool HasNext,
    bool HasPrevious);
