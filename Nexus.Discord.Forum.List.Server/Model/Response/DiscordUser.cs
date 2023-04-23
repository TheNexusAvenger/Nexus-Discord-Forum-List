using Discord;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class DiscordUser
{
    /// <summary>
    /// Id of the user.
    /// </summary>
    public string Id { get; set; } = null!;

    /// <summary>
    /// Name of the user.
    /// </summary>
    public string Name { get; set; } = null!;
    
    /// <summary>
    /// Display name (or name) of the user.
    /// </summary>
    public string DisplayName { get; set; } = null!;

    /// <summary>
    /// Profile picture of the user.
    /// </summary>
    public string ProfilePicture { get; set; } = null!;

    /// <summary>
    /// Gets a DiscordUser for a user in a guild.
    /// </summary>
    /// <param name="user">User to convert.</param>
    /// <returns>Discord user for the information.</returns>
    public static DiscordUser FromGuildUser(IGuildUser user)
    {
        return new DiscordUser()
        {
            Id = user.Id.ToString(),
            Name = user.Username,
            DisplayName = user.Nickname ?? user.Username,
            ProfilePicture = user.GetDisplayAvatarUrl() ?? user.GetAvatarUrl() ?? $"https://cdn.discordapp.com/embed/avatars/{user.Id % 6}.png",
        };
    }
    
    /// <summary>
    /// Gets a DiscordUser for a user id.
    /// </summary>
    /// <param name="userId">User id to convert</param>
    /// <returns>Discord user for the information.</returns>
    public static DiscordUser FromUserId(ulong userId)
    {
        return new DiscordUser()
        {
            Id = userId.ToString(),
            Name = $"<@{userId}>",
            DisplayName = $"<@{userId}>",
            ProfilePicture = $"https://cdn.discordapp.com/embed/avatars/{userId % 6}.png",
        };
    }
}