import redis from "redis";

// host: "redis-11385.c99.us-east-1-4.ec2.redns.redis-cloud.com",
const redisClient = redis.createClient({
  host: "redis-15433.c326.us-east-1-3.ec2.redns.redis-cloud.com",
  port: 15433,
});
redisClient
  .connect()
  .then(() => console.log("Connected to Redis successfully"))
  .catch((error) => console.error("Redis connection error: ", error));

export { redisClient };
