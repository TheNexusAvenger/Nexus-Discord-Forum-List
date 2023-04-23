using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Nexus.Discord.Forum.List.Server.Model.Response;

namespace Nexus.Discord.Forum.List.Server.Controller;

public class PageController
{
    [HttpGet]
    [Route("list/{id}")]
    public async Task<FileStreamResult> BuildThreadListPage(ulong id)
    {
        // Get the initial list data.
        var initialListResponse = (await new ApiController().ListThreads(id)).Value;
        if (initialListResponse is ErrorMessage errorMessage)
        {
            // TODO: Handle error message.
        }
        
        // Build the response.
        var listResponse = (ForumThreadList) initialListResponse!;
        var pageData = (await File.ReadAllTextAsync("web/list.html", Encoding.UTF8))
            .Replace("{initialListResponse}", JsonConvert.SerializeObject(JsonConvert.SerializeObject(initialListResponse)))
            .Replace("{forumName}", listResponse.ForumName)
            .Replace("{serverName}", listResponse.ServerName)
            .Replace("{serverIconUrl}", listResponse.ServerIconUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png");
        return new FileStreamResult(new MemoryStream(Encoding.UTF8.GetBytes(pageData)), "text/html");
    }
}