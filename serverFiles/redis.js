require("dotenv").config();
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

async function incrementUploadCounter() {
  return await redis.incr("uploadCounter");
}

async function getUploadCounter() {
  const count = await redis.get("uploadCounter");
  return parseInt(count) || 0;
}

module.exports = { incrementUploadCounter, getUploadCounter };
