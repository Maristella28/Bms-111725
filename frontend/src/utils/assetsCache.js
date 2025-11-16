// Global cache for requestable assets
class AssetsCache {
  constructor() {
    this.cache = new Map();
    this.CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TIMEOUT) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.cache.has(key);
  }
}

// Global instance
const assetsCache = new AssetsCache();

export default assetsCache;
