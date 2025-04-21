import { redisClient } from "../db/redis.js";

export const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const userId = req.user?.id;
    const key = userId
      ? `${userId}:${req.originalUrl || req.url}`
      : req.originalUrl || req.url;
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }
    const originalSend = res.send.bind(res);
    res.send = async (body) => {
      await redisClient.set(key, body, "EX", duration);
      return originalSend(body);
    };
    next();
  };
};

export const clearCache = (key) => async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const pattern = userId ? `${userId}:${key}*` : `${key}*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((k) => redisClient.del(k)));
      console.log(`Cache cleared for keys matching: ${pattern}`);
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
  next();
};

export const clearDbCache = async (req, res, next) => {
  try {
    await redisClient.FLUSHDB();
    console.log("All Redis data cleared successfully");
  } catch (error) {
    console.error("Error clearing Redis data:", error);
  }
  next();
};
