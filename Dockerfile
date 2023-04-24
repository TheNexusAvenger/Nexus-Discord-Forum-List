FROM mcr.microsoft.com/dotnet/sdk:7.0 as build
ARG CONFIGURATION_FILE_PATH

# Copy the application files and build them.
WORKDIR /build
COPY . .
RUN dotnet build Nexus.Discord.Forum.List.Server -c release -r linux-musl-x64 --self-contained -o /publish
COPY ${CONFIGURATION_FILE_PATH} /publish/configuration.json

# Switch to a container for runtime.
FROM mcr.microsoft.com/dotnet/aspnet:7.0-alpine as runtime

# Prepare the runtime.
WORKDIR /app
COPY --from=build /publish .
RUN apk add wget icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
RUN ln -s Nexus.Discord.Forum.List.Server.dll app.dll
EXPOSE 8000
ENTRYPOINT ["dotnet", "/app/app.dll"]