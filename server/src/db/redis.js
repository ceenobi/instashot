import redis from "redis";

// host: "redis-11385.c99.us-east-1-4.ec2.redns.redis-cloud.com",
const redisClient = redis.createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
redisClient
  .connect()
  .then(() => console.log("Connected to Redis successfully"))
  .catch((error) => console.error("Redis connection error: ", error));

export { redisClient };
