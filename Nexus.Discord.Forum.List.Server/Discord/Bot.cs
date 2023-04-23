using System.Reflection;
using System.Threading.Tasks;
using Discord;
using Discord.Interactions;
using Discord.WebSocket;
using Nexus.Discord.Forum.List.Server.State;

namespace Nexus.Discord.Forum.List.Server.Discord;

public class Bot
{
    /// <summary>
    /// Static instance of the bot.
    /// </summary>
    private static Bot? _bot;
    
    /// <summary>
    /// Client used for Discord.
    /// </summary>
    public readonly DiscordSocketClient Client;
    
    /// <summary>
    /// Interaction service used for commands.
    /// </summary>
    private readonly InteractionService _interactionService;

    /// <summary>
    /// Returns the static instance of the bot.
    /// </summary>
    /// <returns>The static instance of the bot.</returns>
    public static Bot GetBot()
    {
        _bot ??= new Bot();
        return _bot;
    }
    
    /// <summary>
    /// Creates a Bot.
    /// </summary>
    public Bot()
    {
        var config = new DiscordSocketConfig()
        {
            GatewayIntents = GatewayIntents.MessageContent | GatewayIntents.Guilds | GatewayIntents.GuildMembers | GatewayIntents.GuildPresences,
        };
        this.Client = new DiscordSocketClient(config);
        this._interactionService = new InteractionService(this.Client.Rest);
    }
    
    /// <summary>
    /// Starts the Discord bot.
    /// </summary>
    public async Task StartAsync()
    {
        // Initialize the bot.
        this.Client.Log += (message) =>
        {
            Logger.Debug(message.ToString());
            return Task.CompletedTask;
        };
        this.Client.JoinedGuild += async (guild) => await this._interactionService.RegisterCommandsToGuildAsync(guild.Id);
        this.Client.Ready += this.ClientReadyHandler;
        
        // Initialize the interaction service (commands).
        await this._interactionService.AddModulesAsync(Assembly.GetEntryAssembly(), null);
        this.Client.InteractionCreated += async interaction =>
        {
            var context = new SocketInteractionContext(this.Client, interaction);
            await this._interactionService.ExecuteCommandAsync(context, null);
        };
        
        // Start the bot.
        await this.Client.LoginAsync(TokenType.Bot, Configuration.Get().Discord.Token);
        await this.Client.StartAsync();
    }

    /// <summary>
    /// Handles the bot being ready.
    /// </summary>
    private async Task ClientReadyHandler()
    {
        // Register the guild commands.
        // Guild commands load much faster than global commands.
        foreach (var guild in this.Client.Guilds)
        {
            await this._interactionService.RegisterCommandsToGuildAsync(guild.Id);
        }
    }
}