import Redis from "ioredis";
console.log(process.env.REDIS_HOST);
console.log(process.env.REDIS_PORT);
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

export default redis;
