using System.Threading.Tasks;
using Discord.Rest;
using Discord.WebSocket;
using Nexus.Discord.Forum.List.Server.Discord;

namespace Nexus.Discord.Forum.List.Server.Extension;

public static class RestThreadChannelExtensions
{
    public static async Task<SocketThreadChannel> ToSocketThreadChannelAsync(this RestThreadChannel channel)
    {
        return (SocketThreadChannel) await Bot.GetBot().Client.GetChannelAsync(channel.Id);
    }
}