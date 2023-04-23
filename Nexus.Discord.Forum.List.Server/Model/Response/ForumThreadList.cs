using System.Collections.Generic;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class ForumThreadList
{
    /// <summary>
    /// Name of th server.
    /// </summary>
    public string ServerName { get; set; } = null!;

    /// <summary>
    /// URL of the icon of the server.
    /// </summary>
    public string? ServerIconUrl { get; set; }
    
    /// <summary>
    /// Name of th forum.
    /// </summary>
    public string ForumName { get; set; } = null!;
    
    /// <summary>
    /// Tags that can be used by the forum.
    /// </summary>
    public List<ForumThreadTag> Tags { get; set; } = new List<ForumThreadTag>();

    /// <summary>
    /// Threads to display.
    /// </summary>
    public List<ForumThread> Threads { get; set; } = new List<ForumThread>();
}