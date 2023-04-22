using System.Threading.Tasks;
using Discord;
using Microsoft.AspNetCore.Mvc;
using Nexus.Discord.Forum.List.Server.Discord;

namespace Nexus.Discord.Forum.List.Server.Controller;

public class HealthController
{
    [HttpGet]
    [Route("health")]
    public ObjectResult HealthCheck()
    {
        if (Bot.GetBot().Client.ConnectionState == ConnectionState.Connected)
        {
            return new ObjectResult("UP");
        }
        else
        {
            return new ObjectResult("DOWN")
            {
                StatusCode = 503,
            };
        }
    }
}