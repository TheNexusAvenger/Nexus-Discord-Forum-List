using System;
using System.Threading;

namespace Nexus.Discord.Forum.List.Server.Model.Internal;

public class CacheEntry<T>
{
    /// <summary>
    /// Time that the cache entry becomes invalid.
    /// </summary>
    public DateTime InvalidTime { get; set; }

    /// <summary>
    /// Whether the cache entry was loaded.
    /// </summary>
    public bool Loaded { get; set; } = false;
    
    /// <summary>
    /// Value of the cached entry.
    /// </summary>
    public T? Value { get; set; }

    /// <summary>
    /// Lock for reading/writing the value.
    /// </summary>
    public SemaphoreSlim Lock { get; set; } = new SemaphoreSlim(1);
}