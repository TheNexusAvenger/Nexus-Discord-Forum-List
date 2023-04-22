using System.Linq;
using System.Threading.Tasks;
using Discord;
using Discord.WebSocket;
using Microsoft.AspNetCore.Mvc;
using Nexus.Discord.Forum.List.Server.Discord;
using Nexus.Discord.Forum.List.Server.Extension;
using Nexus.Discord.Forum.List.Server.Model.Response;

namespace Nexus.Discord.Forum.List.Server.Controller;

[Route("api/")]
public class ApiController
{
    [HttpGet]
    [Route("list/{id}")]
    public async Task<ForumThreadList> ListThreads(ulong id)
    {
        // Get the channel.
        // TODO: Access errors, incorrect type, not found
        var channel = (SocketForumChannel) Bot.GetBot().Client.GetChannel(id);
        
        // List the threads.
        var response = new ForumThreadList()
        {
            Tags = channel.Tags.Select(ForumThreadTag.FromForumTag).ToList(),
        };
        foreach (var thread in await channel.GetActiveThreadsAsync())
        {
            response.Threads.Add(ForumThread.FromIThreadChannel(await thread.ToSocketThreadChannelAsync()));
        }
        foreach (var thread in await channel.GetPublicArchivedThreadsAsync())
        {
            response.Threads.Add(ForumThread.FromIThreadChannel(thread));
        }
        
        // Build the response.
        return response;
    }
    [HttpGet]
    [Route("contents/{id}")]
    public async Task<ForumThread> GetThreadContents(ulong id)
    {
        // TODO: Access errors, incorrect type, not found.
        return await ForumThread.FromIThreadChannelWithContentsAsync((IThreadChannel) Bot.GetBot().Client.GetChannel(id));
    }
}