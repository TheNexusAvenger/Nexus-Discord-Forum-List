﻿using System.IO;
using System.Text;
using System.Threading.Tasks;
using Discord;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Nexus.Discord.Forum.List.Server.Discord;
using Nexus.Discord.Forum.List.Server.Model.Response;

namespace Nexus.Discord.Forum.List.Server.Controller;

public class PageController
{
    [HttpGet]
    [Route("list/{id}")]
    public async Task<FileStreamResult> BuildThreadListPage(ulong id)
    {
        // Get the initial list data.
        if (Bot.GetBot().Client.ConnectionState != ConnectionState.Connected)
        {
            return await BuildErrorPageAsync("Discord bot is offline.");
        }
        var initialListResponse = (await new ApiController().ListThreads(id)).Value;
        if (initialListResponse is ErrorMessage errorMessage)
        {
            return await BuildErrorPageAsync(errorMessage.Message);
        }
        
        // Build the response.
        var listResponse = (ForumThreadList) initialListResponse!;
        var initialResponseContents = JsonConvert.SerializeObject(listResponse, new JsonSerializerSettings
        {
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            },
        });
        var pageData = (await File.ReadAllTextAsync("web/list.html", Encoding.UTF8))
            .Replace("{initialListResponse}", JsonConvert.SerializeObject(initialResponseContents))
            .Replace("{forumName}", listResponse.ForumName)
            .Replace("{serverName}", listResponse.ServerName)
            .Replace("{serverIconUrl}", listResponse.ServerIconUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png");
        return new FileStreamResult(new MemoryStream(Encoding.UTF8.GetBytes(pageData)), "text/html");
    }

    /// <summary>
    /// Builds an error message response.
    /// </summary>
    /// <param name="errorMessage">Error message to display to the user.</param>
    /// <returns>Error message response to return to the user.</returns>
    private static async Task<FileStreamResult> BuildErrorPageAsync(string errorMessage)
    {
        var pageData = (await File.ReadAllTextAsync("web/error.html", Encoding.UTF8))
            .Replace("{errorMessage}", errorMessage);
        return new FileStreamResult(new MemoryStream(Encoding.UTF8.GetBytes(pageData)), "text/html");
    }
}