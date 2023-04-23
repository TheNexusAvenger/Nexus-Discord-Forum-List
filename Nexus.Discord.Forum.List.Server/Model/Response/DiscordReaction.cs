namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class DiscordReaction
{
    /// <summary>
    /// Character (emoji) for the reaction.
    /// </summary>
    public string Reaction { get; set; } = null!;
    
    /// <summary>
    /// Total amount of reactions.
    /// </summary>
    public int Total { get; set; }
}