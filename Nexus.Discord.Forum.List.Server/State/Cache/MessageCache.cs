using System;
using System.Threading.Tasks;
using Discord;
using Nexus.Discord.Forum.List.Server.Discord;

namespace Nexus.Discord.Forum.List.Server.State.Cache;

public class MessageCache : AbstractCache<ulong, IMessage>
{
    /// <summary>
    /// Static instance of the message cache.
    /// </summary>
    public static readonly MessageCache StaticMessageCache = new MessageCache();
    
    /// <summary>
    /// Determines the expire time for a cache entry.
    /// </summary>
    /// <returns>The expire time for a new cache entry.</returns>
    public override DateTime GetExpireTime()
    {
        return DateTime.Now.AddSeconds(Configuration.Get().Cache.MessageCacheSeconds);
    }

    /// <summary>
    /// Creates a cache entry value.
    /// </summary>
    /// <param name="key">Key to use.</param>
    /// <returns>Value for the key.</returns>
    public override async Task<IMessage> GetCacheEntryAsync(ulong key)
    {
        return await ((IThreadChannel) await Bot.GetBot().Client.GetChannelAsync(key)).GetMessageAsync(key);
    }
}