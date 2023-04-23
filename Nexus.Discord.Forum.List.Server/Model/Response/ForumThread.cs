using System;
using Discord;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Nexus.Discord.Forum.List.Server.Discord;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class ForumThread
{
    /// <summary>
    /// Id of the thread.
    /// </summary>
    public string Id { get; set; } = null!;

    /// <summary>
    /// URL used to access the thread.
    /// </summary>
    public string Url { get; set; } = null!;
    
    /// <summary>
    /// Title of the thread.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Name of the original poster.
    /// </summary>
    public DiscordUser OriginalPoster { get; set; } = null!;
    
    /// <summary>
    /// Total members in the thread.
    /// </summary>
    public int MemberCount { get; set; }
    
    /// <summary>
    /// Total responses in the thread.
    /// </summary>
    public int MessageCount { get; set; }
    
    /// <summary>
    /// Time the post was created.
    /// </summary>
    public DateTimeOffset CreateTime { get; set; }

    /// <summary>
    /// Ids of the tags for the thread.
    /// </summary>
    public List<string> Tags { get; set; } = new List<string>();

    /// <summary>
    /// Message of the first post of the thread.
    /// </summary>
    public ForumThreadMessage? Message { get; set; }

    /// <summary>
    /// Current access for a thread.
    /// </summary>
    public ForumThreadAccessState AccessState { get; set; } = null!;
    
    /// <summary>
    /// Builds a ForumThread instance for a thread channel.
    /// </summary>
    /// <param name="channel">Thread channel to convert.</param>
    /// <returns>Converted thread instance.</returns>
    public static ForumThread FromIThreadChannel(IThreadChannel channel)
    {
        // Get the author and contents.
        var guild = Bot.GetBot().Client.Guilds.First((guild) => guild.Id == channel.GuildId);
        var author = guild.GetUser(channel.OwnerId);

        // Build the response.
        return new ForumThread()
        {
            Id = channel.Id.ToString(),
            Url = $"discord://discord.com/channels/{channel.GuildId}/{channel.Id}/",
            Name = channel.Name,
            OriginalPoster = author != null ? DiscordUser.FromGuildUser(author) : DiscordUser.FromUserId(channel.OwnerId),
            MemberCount = channel.MemberCount,
            MessageCount = channel.MessageCount,
            CreateTime = channel.CreatedAt,
            Tags = channel.AppliedTags.Select(tag => tag.ToString()).ToList(),
            AccessState = ForumThreadAccessState.FromIThreadChannel(channel),
        };
    }
    
    /// <summary>
    /// Builds a ForumThread instance with message contents for a thread channel.
    /// </summary>
    /// <param name="channel">Thread channel to convert.</param>
    /// <returns>Converted thread instance.</returns>
    public static async Task<ForumThread> FromIThreadChannelWithContentsAsync(IThreadChannel channel)
    {
        var response = FromIThreadChannel(channel);
        response.Message = await ForumThreadMessage.FromIThreadChannelAsync(channel);
        return response;
    }
}