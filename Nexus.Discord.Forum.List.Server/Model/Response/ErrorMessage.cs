using Discord;

namespace Nexus.Discord.Forum.List.Server.Model.Response;

public class ErrorMessage
{
    /// <summary>
    /// Computer-readable code of the error message.
    /// </summary>
    public string Code { get; set; }
    
    /// <summary>
    /// Human-readable message of the error message.
    /// </summary>
    public string Message { get; set; }

    /// <summary>
    /// Creates an error message.
    /// </summary>
    /// <param name="code">Code of the error message.</param>
    /// <param name="message">Message of the error message.</param>
    private ErrorMessage(string code, string message)
    {
        this.Code = code;
        this.Message = message;
    }

    /// <summary>
    /// Error message for a channel not being found.
    /// </summary>
    public static readonly ErrorMessage ChannelNotFound = new ErrorMessage("ChannelNotFound", "The requested channel can't be found by the bot.");

    /// <summary>
    /// Error message for a forum channel existing but not being accessible.
    /// </summary>
    public static readonly ErrorMessage ForumNotAccessible = new ErrorMessage("ForumNotAccessible", "The requested forum can't be accessed by the bot.");

    /// <summary>
    /// Creates an InvalidChannelType error message.
    /// </summary>
    /// <param name="channelType">Channel type that was expected.</param>
    /// <param name="channel">Channel that was used.</param>
    /// <returns>Error message to return.</returns>
    public static ErrorMessage CreateInvalidChannelTypeMessage(ChannelType channelType, IChannel channel)
    {
        return new ErrorMessage("InvalidChannelType", $"The requested channel must be a {channelType}, not {channel.GetChannelType()}.");
    }
}