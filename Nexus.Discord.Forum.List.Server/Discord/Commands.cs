using System.Threading.Tasks;
using Discord;
using Discord.Interactions;
using Discord.Net;
using Nexus.Discord.Forum.List.Server.State;

namespace Nexus.Discord.Forum.List.Server.Discord;

public class Commands : InteractionModuleBase
{
    [SlashCommand("getlink", "Gets the link to view a forum channel.")]
    public async Task GetLink(IForumChannel channel)
    {
        // Return if the channel can't be viewed.
        try
        {
            await channel.GetPublicArchivedThreadsAsync();
        }
        catch (HttpException)
        {
            await this.RespondAsync($"<#{channel.Id}> is not visible to this bot.", ephemeral: true);
            return;
        }
        
        // Return the link.
        await this.RespondAsync($"<#{channel.Id}> can be viewed using {Configuration.Get().Server.BaseUrl}/list/{channel.Id}", ephemeral: true);
    }
}