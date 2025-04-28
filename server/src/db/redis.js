import redis from "redis";

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
