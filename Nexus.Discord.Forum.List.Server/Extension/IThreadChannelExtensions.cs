using System.Threading.Tasks;
using Discord;

namespace Nexus.Discord.Forum.List.Server.Extension;

public static class IThreadChannelExtensions
{
    /// <summary>
    /// Returns the first message of a thread.
    /// </summary>
    /// <param name="this">Thread to get the first message for.</param>
    /// <returns>The first message of the thread.</returns>
    public static async Task<IMessage?> GetFirstMessageAsync(this IThreadChannel @this)
    {
        return await @this.GetMessageAsync(@this.Id);
    }
}