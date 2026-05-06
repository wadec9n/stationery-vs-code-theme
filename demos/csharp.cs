// Blog post manager with tag-based filtering.
// Showcases records, pattern matching, LINQ, async streams,
// nullable reference types, and file-scoped namespaces.

#nullable enable

using System.Text.Json.Serialization;

namespace Example.Blog;

public enum Status { Draft, Published, Archived }

public record Author(string Name, string? Twitter = null)
{
    public string Handle => Twitter is null ? Name.ToLowerInvariant() : $"@{Twitter}";
}

public record Post(
    int Id,
    string Title,
    string Body,
    Author Author,
    Status Status,
    DateOnly PublishedOn,
    [property: JsonPropertyName("tags")] IReadOnlyList<string> Tags)
{
    public bool MatchesTag(string tag) =>
        Tags.Any(t => string.Equals(t, tag, StringComparison.OrdinalIgnoreCase));
}

public sealed class Blog
{
    private readonly List<Post> _posts = new();
    private static readonly TimeSpan FreshWindow = TimeSpan.FromDays(30);

    public int Count => _posts.Count;

    public Post Add(Post post)
    {
        ArgumentNullException.ThrowIfNull(post);
        _posts.Add(post);
        return post;
    }

    public string Describe(Post post) => post switch
    {
        { Status: Status.Draft }                 => $"draft: \"{post.Title}\"",
        { Status: Status.Archived }              => $"archived: \"{post.Title}\"",
        { Tags.Count: 0 }                        => $"untagged: \"{post.Title}\"",
        var p when p.PublishedOn > DateOnly.FromDateTime(DateTime.Today).AddDays(-30) => $"fresh: \"{p.Title}\"",
        _                                        => $"published: \"{post.Title}\"",
    };

    public IEnumerable<Post> ByTag(string tag) =>
        from p in _posts
        where p.Status is Status.Published && p.MatchesTag(tag)
        orderby p.PublishedOn descending
        select p;

    public async IAsyncEnumerable<string> RenderAllAsync()
    {
        foreach (var post in _posts.Where(p => p.Status == Status.Published))
        {
            await Task.Yield();
            yield return $"# {post.Title}\nby {post.Author.Handle}\n\n{post.Body}";
        }
    }

    public static Blog Seed() => new Blog()
        .With(new Post(1, "Hello, world", "First!",
            new Author("Ada", "ada"), Status.Published,
            DateOnly.FromDateTime(DateTime.UtcNow), new[] { "intro", "meta" }))
        .With(new Post(2, "On focus", "Working notes...",
            new Author("Grace"), Status.Draft,
            DateOnly.FromDateTime(DateTime.UtcNow), Array.Empty<string>()));

    public Blog With(Post p) { Add(p); return this; }
}

public static class Program
{
    public static async Task Main()
    {
        var blog = Blog.Seed();
        await foreach (var rendered in blog.RenderAllAsync())
            Console.WriteLine(rendered);

        Console.WriteLine($"Total: {blog.Count}");
    }
}
