package com.managemyopz.security.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SecurityCacheService {

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, String> localCache = new ConcurrentHashMap<>();
    private boolean redisAvailable = true;

    @Autowired(required = false)
    public SecurityCacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        if (redisTemplate == null) {
            log.warn("StringRedisTemplate is not configured. Security Cache will use local in-memory store.");
            this.redisAvailable = false;
        }
    }

    public void put(String key, String value, Duration timeout) {
        if (redisAvailable && redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, value, timeout);
                return;
            } catch (Exception e) {
                log.warn("Redis connection failed. Falling back to local in-memory cache. Error: {}", e.getMessage());
                redisAvailable = false;
            }
        }
        localCache.put(key, value);
    }

    public String get(String key) {
        if (redisAvailable && redisTemplate != null) {
            try {
                return redisTemplate.opsForValue().get(key);
            } catch (Exception e) {
                log.warn("Redis connection failed. Falling back to local in-memory cache. Error: {}", e.getMessage());
                redisAvailable = false;
            }
        }
        return localCache.get(key);
    }

    public void evict(String key) {
        if (redisAvailable && redisTemplate != null) {
            try {
                redisTemplate.delete(key);
                return;
            } catch (Exception e) {
                log.warn("Redis connection failed. Falling back to local in-memory cache. Error: {}", e.getMessage());
                redisAvailable = false;
            }
        }
        localCache.remove(key);
    }
}
