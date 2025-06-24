require("dotenv").config();
const fetch = require("node-fetch");

const REDIS_URL = process.env.REDIS_URL;
const AUTH_TOKEN = process.env.REDIS_TOKEN;

async function incrementUploadCounter() {
  const response = await fetch(`${REDIS_URL}/incr/uploadCounter`, {
    headers: { Authorization: AUTH_TOKEN }
  });
  const data = await response.json();
  return data.result;
}

async function getUploadCounter() {
  const response = await fetch(`${REDIS_URL}/get/uploadCounter`, {
    headers: { Authorization: AUTH_TOKEN }
  });
  const data = await response.json();
  return parseInt(data.result || "0", 10);
}

module.exports = { incrementUploadCounter, getUploadCounter };
