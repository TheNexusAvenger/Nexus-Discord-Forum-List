using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Nexus.Discord.Forum.List.Server.Model.Internal;

namespace Nexus.Discord.Forum.List.Server.State.Cache;

public abstract class AbstractCache<T1, T2> where T1 : notnull
{
    /// <summary>
    /// Active cache entries.
    /// </summary>
    private readonly Dictionary<T1, CacheEntry<T2>> _cacheEntries = new Dictionary<T1, CacheEntry<T2>>();

    /// <summary>
    /// Lock for accessing cache entries.
    /// </summary>
    private readonly SemaphoreSlim _lock = new SemaphoreSlim(1);

    /// <summary>
    /// Determines the expire time for a cache entry.
    /// </summary>
    /// <returns>The expire time for a new cache entry.</returns>
    public abstract DateTime GetExpireTime();

    /// <summary>
    /// Creates a cache entry value.
    /// </summary>
    /// <param name="key">Key to use.</param>
    /// <returns>Value for the key.</returns>
    public abstract Task<T2> GetCacheEntryAsync(T1 key);

    /// <summary>
    /// Returns a cached value.
    /// </summary>
    /// <param name="key">Key to fetch.</param>
    /// <returns>Value to fetch from.</returns>
    public async Task<T2?> GetAsync(T1 key)
    {
        // Get the cache entry.
        await this._lock.WaitAsync();
        if (_cacheEntries.TryGetValue(key, out var existingCacheEntry) && DateTime.Now > existingCacheEntry.InvalidTime)
        {
            this._cacheEntries.Remove(key);
        }
        if (!this._cacheEntries.ContainsKey(key))
        {
            this._cacheEntries[key] = new CacheEntry<T2>()
            {
                InvalidTime = this.GetExpireTime(),
            };
        }
        var cacheEntry = this._cacheEntries[key];
        this._lock.Release();
        
        // Get and return the value.
        await cacheEntry.Lock.WaitAsync();
        if (!cacheEntry.Loaded)
        {
            try
            {
                cacheEntry.Value = await this.GetCacheEntryAsync(key);
                cacheEntry.Loaded = true;
            }
            catch (Exception e)
            {
                Logger.Error($"Failed to fetch key {key} for {this}: {e}");
            }
        }
        cacheEntry.Lock.Release();
        return cacheEntry.Value;
    }
}