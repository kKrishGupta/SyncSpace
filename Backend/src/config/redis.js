const {createClient} = require('redis');
const logger = require('../utils/logger')

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
  url: redisUrl
});

redisClient.on("connect",() =>{
  logger.info("Redis Connecting....")
});

redisClient.on("ready" ,() =>{
  logger.info("Redis connected and ready to use")
});

redisClient.on("error",() =>{
  logger.error("Redis connection error",error.message);
});

redisClient.on("reconnecting",() =>{
  logger.info("Redis reconnecting....")
});

redisClient.on("end",() =>{
  logger.info("Redis connection ended")
});

const connectRedis = async () => {
  try {
    await redisClient.connect();  
  } catch (error) {
    logger.error("Redis connection error",error.message);
  }     
};

const redisPublisher = redisClient.duplicate();
const redisSubscriber = redisClient.duplicate();

const connectRedisPubSub = async () => {
  if(!redisPublisher.isOpen){
    await redisPublisher.connect();
  }
  if(!redisSubscriber.isOpen){
    await redisSubscriber.connect();
  }
  return {redisPublisher,redisSubscriber};
};

module.exports = {
  redisClient,
  redisPublisher,
  redisSubscriber,
  connectRedis,
  connectRedisPubSub
}

