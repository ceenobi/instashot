import redis from "redis";

const redisClient = redis.createClient({
  host: "redis-11385.c99.us-east-1-4.ec2.redns.redis-cloud.com",
  port: 11385,
});
redisClient
  .connect()
  .then(() => console.log("Connected to Redis successfully"))
  .catch((error) => console.error("Redis connection error: ", error));

export { redisClient };
