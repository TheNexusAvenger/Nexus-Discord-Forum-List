# Nexus-Discord-Forum-List
Nexus Discord Forum List is a Discord bot and web server for viewing Discord forum
channels in a browser with more advanced filters. It originally developed for
[Innovation Inc Thermal Power Plant on Roblox](https://www.roblox.com/games/2337178805/Innovation-Inc-Thermal-Power-Plant)
to identify bugs that are missing tags (as opposed to searching for posts with tags).

## Accessing Forums
In order to access a forum, a URL is required. With the bot in a server, `/getlink`
will generate the URL for a forum. It will also verify having read permissions to
the channel.

## Provided Bot
An instance of the bot is publicly available [with the following URL](https://discord.com/api/oauth2/authorize?client_id=1098993855577206817&permissions=0&scope=bot%20applications.commands).
However, it is recommended to host your own instance to not rely on someone else.
Besides the built app and configuration file, the server application only operates
in memory with no database.

See the Permissions section under Setup.

## Setup
For the setup, it is assumed you have a host somewhere. SSL is not required.
Docker is assumed for the following steps.

### Discord Bot
In the [Discord developer portal](https://discord.com/developers/applications/),
an application with a bot needs to be configured. The bot needs "Message Content Intent"
to view and load messages and optionally "Presence Intent" and "Server Members Intent"
to fetch usernames for posts.

### Server Permissions
Once the bot is in the server, the bot must be able to view the forum channels that
are meant to be viewed in the browser. It is recommended but not required to restrict
the bot to not be able to view non-forum channels and to make the access read-only for
the forum channels.

### Configuration
Create a directory named `configurations` and create the file `configuration.json` in
that directory with the following contents:
```json
{
  "Discord": {
    "Token": "DISCORD_BOT_TOKEN_HERE"
  },
  "Server": {
    "Port": 8000,
    "BaseUrl": "https://my-host-without-an-ending-slash"
  },
  "Cache": {
    "MessageCacheSeconds": 10
  },
  "Page": {
    "GithubUrl": "https://github.com/TheNexusAvenger/Nexus-Discord-Forum-List",
    "Host": "YOUR_NAME_HERE"
  }
}
```

Fields that aren't specified will use default values. It is recommended to change the following:
- `Discord.Token`: Discord API token for the bot created before.
- `Server.BaseUrl`: Base URL that users will be directed to when using `/getlink` in Discord.
  For `thenexusavenger.io`'s hosting, this is `https://discord-forum-list.thenexusavenger.io`.
  Make sure to include a trailing slash.
- `Page.GithubUrl`: If using a fork, optionally change the URL so the right repository is linked.
- `Page.Host`: At the bottom of the page, `Nexus Discord Forum List, hosted by YOUR_NAME_HERE.`
  is displayed. It is only to show who is hosting the bot and can be any string.

### Server Application
The application can be compiled and run using .NET 7. It is highly recommended to use Docker if
possible for running. Using the docker-compose.yml on a system set up with Docker, the server can
be built (or updated) and started with the following when run in the root directory of the project.

```bash
docker compose up -d --build
```

Stopping the server is done with the following:

```bash
docker compose down
```

## Limitations
- **There is no authentication methods to view forums.** This means forums with the first message will
  be public to the internet.
- Filters only operate as an "AND". It isn't possible to specify "OR", such as a thread having Tag1
  OR Tag2.
- Sorting is only done based on the creation date, not the last activity.
- Threads being pinned aren't shown.
- Custom emojis and super reactions aren't shown correctly.
- Names aren't displayed for members who have left the server.
- Name colors based on roles aren't displayed for members.
- Mobile may work but isn't supported. The text may be too small.

## License
Nexus Discord Forum List is available under the terms of the GNU Lesser General Public
License. See [LICENSE](LICENSE) for details.