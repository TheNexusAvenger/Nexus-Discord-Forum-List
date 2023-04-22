using System.Collections.Generic;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class ForumThreadList
{
    /// <summary>
    /// Tags that can be used by the forum.
    /// </summary>
    public List<ForumThreadTag> Tags { get; set; } = new List<ForumThreadTag>();

    /// <summary>
    /// Threads to display.
    /// </summary>
    public List<ForumThread> Threads { get; set; } = new List<ForumThread>();
}