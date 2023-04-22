using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Nexus.Discord.Forum.List.Server.Discord;
using Nexus.Discord.Forum.List.Server.State;

namespace Nexus.Discord.Forum.List.Server;

public class Program
{
    /// <summary>
    /// Runs the program.
    /// </summary>
    /// <param name="args">Arguments from the command line.</param>
    public static void Main(string[] args)
    {
        // Load the configuration.
        Configuration.Load();
        
        // Start the Discord bot.
        Logger.Debug("Starting Discord bot.");
        Bot.GetBot().StartAsync().Wait();
        Logger.Debug("Started Discord bot.");
        
        // Build the server.
        Logger.Debug("Preparing web server.");
        var builder = WebApplication.CreateBuilder(args);
        builder.Logging.ClearProviders();
        builder.Logging.AddProvider(Logger.NexusLogger);
        builder.Services.AddControllers();
            
        // Start the server.
        var port = Configuration.Get().Server.Port;
        var app = builder.Build();
        app.UseExceptionHandler(exceptionHandlerApp =>
        {
            exceptionHandlerApp.Run(context =>
            {
                var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
                if (exceptionHandlerPathFeature != null)
                {
                    Logger.Error($"An exception occurred processing {context.Request.Method} {context.Request.Path}\n{exceptionHandlerPathFeature.Error}");
                }
                return Task.CompletedTask;
            });
        });
        app.MapControllers();
        Logger.Info($"Starting server on port {port}.");
        app.Run($"http://*:{port}");
    }
}