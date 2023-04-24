using System;
using System.IO;
using Newtonsoft.Json;

namespace Nexus.Discord.Forum.List.Server.State;

public class Configuration
{
    public class DiscordConfiguration
    {
        /// <summary>
        /// Token for the Discord bot.
        /// </summary>
        public string Token { get; set; } = "default";
    }

    public class ServerConfiguration
    {
        /// <summary>
        /// Port to host the server on.
        /// </summary>
        public ushort Port { get; set; } = 8000;

        /// <summary>
        /// Base URL to show when a user requests a link.
        /// </summary>
        public string BaseUrl { get; set; } = "http://localhost:8000";
    }
    
    public class CacheConfiguration
    {
        /// <summary>
        /// Time in seconds that messages are cached.
        /// </summary>
        public ulong MessageCacheSeconds { get; set; } = 10;
    }

    public class PageConfiguration
    {
        /// <summary>
        /// GitHub URL to link to on the web page.
        /// </summary>
        public string GithubUrl { get; set; } = "https://github.com/TheNexusAvenger/Nexus-Discord-Forum-List";

        /// <summary>
        /// Name of the host of the bot + server.
        /// </summary>
        public string Host { get; set; } = "default";
    }
    
    /// <summary>
    /// Configuration for Discord.
    /// </summary>
    public DiscordConfiguration Discord { get; set; } = new DiscordConfiguration();

    /// <summary>
    /// Configuration for the caching.
    /// </summary>
    public CacheConfiguration Cache { get; set; } = new CacheConfiguration();

    /// <summary>
    /// Configuration for the server.
    /// </summary>
    public ServerConfiguration Server { get; set; } = new ServerConfiguration();

    /// <summary>
    /// Configuration for the web page.
    /// </summary>
    public PageConfiguration Page { get; set; } = new PageConfiguration();
    
    /// <summary>
    /// Static configuration used.
    /// </summary>
    private static Configuration? _staticConfiguration;

    /// <summary>
    /// Loads the configuration.
    /// </summary>
    public static void Load()
    {
        // Get the configuration path if it isn't defined.
        var path = Environment.GetEnvironmentVariable("CONFIGURATION_FILE_LOCATION");
        path ??= "configuration.json"; 
        
        // Write the configuration if it doesn't exist and then load the configuration.
        if (!File.Exists(path))
        {
            File.WriteAllText(path, JsonConvert.SerializeObject(new Configuration(), Formatting.Indented));
        }
        _staticConfiguration = JsonConvert.DeserializeObject<Configuration>(File.ReadAllText(path))!;
    }

    /// <summary>
    /// Returns the statically loaded configuration.
    /// </summary>
    /// <returns>The static configuration of the system.</returns>
    public static Configuration Get()
    {
        if (_staticConfiguration == null)
        {
            Load();
        }
        return _staticConfiguration!;
    }
}