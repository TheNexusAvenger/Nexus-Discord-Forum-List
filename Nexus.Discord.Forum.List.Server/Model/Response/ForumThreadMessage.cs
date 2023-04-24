using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Discord;
using Nexus.Discord.Forum.List.Server.Extension;
using Nexus.Discord.Forum.List.Server.State.Cache;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class ForumThreadMessage
{
    /// <summary>
    /// Message (non-media) of the first post of the thread.
    /// </summary>
    public string Message { get; set; } = null!;
    
    /// <summary>
    /// Time the post was last edited, if any.
    /// </summary>
    public DateTimeOffset? EditTime { get; set; }

    /// <summary>
    /// Attachments of the first post of the thread.
    /// </summary>
    public List<DiscordAttachment> Attachments { get; set; } = new List<DiscordAttachment>();

    /// <summary>
    /// Reactions to the message.
    /// </summary>
    public List<DiscordReaction> Reactions { get; set; } = new List<DiscordReaction>();

    /// <summary>
    /// Builds a ForumThreadMessage instance for a thread channel.
    /// </summary>
    /// <param name="channel">Thread channel to convert.</param>
    /// <returns>Converted thread message instance.</returns>
    public static async Task<ForumThreadMessage?> FromIThreadChannelAsync(IThreadChannel channel)
    {
        // Get the message and return if there is none (deleted).
        var message = await MessageCache.StaticMessageCache.GetAsync(channel.Id);
        if (message == null) return null;
        
        // Build the message.
        var reactions = message.Reactions.Select(reaction => new DiscordReaction()
        {
            Reaction = reaction.Key.Name,
            Total = reaction.Value.ReactionCount,
        }).OrderByDescending(reaction => reaction.Total).ToList();
        return new ForumThreadMessage()
        {
            Message = HttpUtility.HtmlEncode(message.Content),
            EditTime = message.EditedTimestamp,
            Attachments = message.Attachments.Select(DiscordAttachment.FromIAttachment).ToList(),
            Reactions = reactions,
        };
    }
}