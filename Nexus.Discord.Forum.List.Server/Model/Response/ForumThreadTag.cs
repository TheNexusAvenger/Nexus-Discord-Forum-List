using Discord;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class ForumThreadTag
{
    /// <summary>
    /// Id of the tag.
    /// </summary>
    public ulong Id { get; set; }

    /// <summary>
    /// Name of the tag.
    /// </summary>
    public string Name { get; set; } = null!;
    
    /// <summary>
    /// Emoji used for the tag.
    /// </summary>
    public string? Emoji { get; set; }

    /// <summary>
    /// Creates a ForumThreadTag from a ForumTag.
    /// </summary>
    /// <param name="tag">ForumTag to convert from.</param>
    /// <returns>ForumThreadTag for the data.</returns>
    public static ForumThreadTag FromForumTag(ForumTag tag)
    {
        return new ForumThreadTag()
        {
            Id = tag.Id,
            Name = tag.Name,
            Emoji = tag.Emoji?.Name,
        };
    }
}