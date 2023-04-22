using Discord;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class ForumThreadAccessState
{
    /// <summary>
    /// Whether the thread is closed/archived.
    /// </summary>
    public bool IsArchived { get; set; }
    
    /// <summary>
    /// Whether the thread is locked.
    /// </summary>
    public bool IsLocked { get; set; }
    
    /// <summary>
    /// Builds a ForumThreadAccessState from a thread channel.
    /// </summary>
    /// <param name="channel">Thread channel to convert.</param>
    /// <returns>Converted access state instance.</returns>
    public static ForumThreadAccessState FromIThreadChannel(IThreadChannel channel)
    {
        return new ForumThreadAccessState()
        {
            IsArchived = channel.IsArchived,
            IsLocked = channel.IsLocked,
        };
    }
}