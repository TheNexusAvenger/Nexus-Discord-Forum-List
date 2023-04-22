using Discord;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class DiscordAttachment
{
    /// <summary>
    /// Name of the attachment.
    /// </summary>
    public string Name { get; set; } = null!;
    
    /// <summary>
    /// URL of the attachment.
    /// </summary>
    public string Url { get; set; } = null!;

    /// <summary>
    /// Content type of the attachment.
    /// </summary>
    public string ContentType { get; set; } = null!;

    /// <summary>
    /// Creates a DiscordAttachment from an IAttachment.
    /// </summary>
    /// <param name="attachment">IAttachment to convert from.</param>
    /// <returns>The converted DiscordAttachment.</returns>
    public static DiscordAttachment FromIAttachment(IAttachment attachment)
    {
        return new DiscordAttachment()
        {
            Name = attachment.Filename,
            Url = attachment.Url,
            ContentType = attachment.ContentType,
        };
    }
}