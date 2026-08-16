const mongoose = require('mongoose');
const logger = require('../utils/logger');


const connectDB = async() =>{
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');
  }
  catch (error) {
    logger.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
}

module.exports = connectDB;