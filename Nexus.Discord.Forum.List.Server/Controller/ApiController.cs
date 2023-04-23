using System.Linq;
using System.Threading.Tasks;
using Discord;
using Discord.Net;
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
    public async Task<ObjectResult> ListThreads(ulong id)
    {
        // Get the channel.
        var channel = Bot.GetBot().Client.GetChannel(id);
        if (channel == null)
        {
            return new ObjectResult(ErrorMessage.ChannelNotFound)
            {
                StatusCode = 404,
            };
        }
        if (channel.GetChannelType() != ChannelType.Forum)
        {
            return new ObjectResult(ErrorMessage.CreateInvalidChannelTypeMessage(ChannelType.Forum, channel))
            {
                StatusCode = 400,
            };
        }
        
        // List the threads.
        var forumChannel = (SocketForumChannel) channel;
        var response = new ForumThreadList()
        {
            ServerName = forumChannel.Guild.Name,
            ServerIconUrl = forumChannel.Guild.IconUrl,
            ForumName = forumChannel.Name,
            Tags = forumChannel.Tags.Select(ForumThreadTag.FromForumTag).ToList(),
        };
        foreach (var thread in await forumChannel.GetActiveThreadsAsync())
        {
            response.Threads.Add(ForumThread.FromIThreadChannel(await thread.ToSocketThreadChannelAsync()));
        }
        try
        {
            foreach (var thread in await forumChannel.GetPublicArchivedThreadsAsync())
            {
                response.Threads.Add(ForumThread.FromIThreadChannel(thread));
            }
        }
        catch (HttpException)
        {
            return new ObjectResult(ErrorMessage.ForumNotAccessible)
            {
                StatusCode = 403,
            };
        }

        // Build the response.
        return new ObjectResult(response);
    }
    
    [HttpGet]
    [Route("contents/{id}")]
    public async Task<ObjectResult> GetThreadContents(ulong id)
    {
        // Get the channel.
        var channel = Bot.GetBot().Client.GetChannel(id);
        if (channel == null)
        {
            return new ObjectResult(ErrorMessage.ChannelNotFound)
            {
                StatusCode = 404,
            };
        }
        if (channel.GetChannelType() != ChannelType.PublicThread)
        {
            return new ObjectResult(ErrorMessage.CreateInvalidChannelTypeMessage(ChannelType.PublicThread, channel))
            {
                StatusCode = 400,
            };
        }
        
        // Build the response.
        return new ObjectResult(await ForumThread.FromIThreadChannelWithContentsAsync((IThreadChannel) channel));
    }
}