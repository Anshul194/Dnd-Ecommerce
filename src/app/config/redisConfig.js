import Redis from 'ioredis';

// Global Redis configuration class
class RedisConfig {
  constructor() {
    this.isEnabled = process.env.REDIS_ENABLED !== 'false'; // Default to true unless explicitly disabled
    this.client = null;
    this.mockStorage = new Map(); // In-memory fallback when Redis is disabled
    this.initialized = false;
  }

  // Initialize Redis connection if enabled
  async initialize() {
    if (this.initialized) return;

    if (this.isEnabled) {
      try {
        this.client = new Redis({
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWORD,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true, // Don't connect immediately
        });

        this.client.on('connect', () => {
          console.log('✅ Redis connected globally');
        });

        this.client.on('error', (err) => {
          console.error('❌ Redis connection error:', err);
          // Fallback to disabled mode on connection errors
          this.setEnabled(false);
        });

        this.client.on('close', () => {
          console.log('⚠️ Redis connection closed');
        });

        // Test connection
        await this.client.ping();
        console.log('🔄 Redis connection test successful');
      } catch (error) {
        console.error('Failed to initialize Redis:', error);
        this.setEnabled(false);
      }
    } else {
      console.log('📴 Redis is disabled - using in-memory fallback');
    }

    this.initialized = true;
  }

  // Enable Redis globally
  async setEnabled(enabled) {
    const wasEnabled = this.isEnabled;
    this.isEnabled = enabled;

    if (enabled && !wasEnabled && !this.client) {
      await this.initialize();
    } else if (!enabled && wasEnabled && this.client) {
      await this.disconnect();
    }

    console.log(`🔄 Redis globally ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Check if Redis is enabled
  isRedisEnabled() {
    return this.isEnabled;
  }

  // Get Redis client or mock
  getClient() {
    if (this.isEnabled && this.client) {
      return this.client;
    }
    return this.getMockClient();
  }

  // Mock Redis client for when Redis is disabled
  getMockClient() {
    const self = this;
    return {
      // Basic Redis commands with in-memory fallback
      async get(key) {
        console.log(`📝 [MOCK] GET ${key}`);
        return self.mockStorage.get(key) || null;
      },

      async set(key, value, ...args) {
        console.log(`📝 [MOCK] SET ${key} = ${value}`);
        self.mockStorage.set(key, value);
        return 'OK';
      },

      async setex(key, seconds, value) {
        console.log(`📝 [MOCK] SETEX ${key} ${seconds} = ${value}`);
        self.mockStorage.set(key, value);
        // In a real implementation, you might want to set up a timeout
        setTimeout(() => {
          self.mockStorage.delete(key);
        }, seconds * 1000);
        return 'OK';
      },

      async del(key) {
        console.log(`📝 [MOCK] DEL ${key}`);
        const existed = self.mockStorage.has(key);
        self.mockStorage.delete(key);
        return existed ? 1 : 0;
      },

      async exists(key) {
        console.log(`📝 [MOCK] EXISTS ${key}`);
        return self.mockStorage.has(key) ? 1 : 0;
      },

      async ping() {
        console.log(`📝 [MOCK] PING`);
        return 'PONG';
      },

      async flushall() {
        console.log(`📝 [MOCK] FLUSHALL`);
        self.mockStorage.clear();
        return 'OK';
      },

      async keys(pattern) {
        console.log(`📝 [MOCK] KEYS ${pattern}`);
        const keys = Array.from(self.mockStorage.keys());
        if (pattern === '*') return keys;
        // Simple pattern matching for common patterns
        return keys.filter(key => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(key);
          }
          return key === pattern;
        });
      },

      async hget(key, field) {
        console.log(`📝 [MOCK] HGET ${key} ${field}`);
        const hash = self.mockStorage.get(key);
        return hash && typeof hash === 'object' ? hash[field] || null : null;
      },

      async hset(key, field, value) {
        console.log(`📝 [MOCK] HSET ${key} ${field} = ${value}`);
        let hash = self.mockStorage.get(key);
        if (!hash || typeof hash !== 'object') {
          hash = {};
        }
        hash[field] = value;
        self.mockStorage.set(key, hash);
        return 1;
      },

      async hdel(key, field) {
        console.log(`📝 [MOCK] HDEL ${key} ${field}`);
        const hash = self.mockStorage.get(key);
        if (hash && typeof hash === 'object' && field in hash) {
          delete hash[field];
          return 1;
        }
        return 0;
      },

      // Add more Redis commands as needed
      async expire(key, seconds) {
        console.log(`📝 [MOCK] EXPIRE ${key} ${seconds}`);
        if (self.mockStorage.has(key)) {
          setTimeout(() => {
            self.mockStorage.delete(key);
          }, seconds * 1000);
          return 1;
        }
        return 0;
      },

      async ttl(key) {
        console.log(`📝 [MOCK] TTL ${key}`);
        // Mock implementation - in real scenario you'd track expiration times
        return self.mockStorage.has(key) ? -1 : -2;
      }
    };
  }

  // Disconnect Redis client
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
    this.mockStorage.clear();
    this.initialized = false;
  }

  // Get status information
  getStatus() {
    return {
      enabled: this.isEnabled,
      connected: this.client ? this.client.status === 'ready' : false,
      initialized: this.initialized,
      mockStorageSize: this.mockStorage.size
    };
  }
}

// Singleton instance
const redisConfig = new RedisConfig();

export default redisConfig;
