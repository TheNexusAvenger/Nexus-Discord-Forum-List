using System;
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
        
        // Keep the bot up.
        // TODO: Replace with starting server.
        while (true) Console.ReadLine();
    }
}