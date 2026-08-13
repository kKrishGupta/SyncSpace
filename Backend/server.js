require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async() =>{
  try {

    await connectDB();
    app.listen(PORT, () =>{
      logger.info(`Server is running on port http://localhost:${PORT}`);
    });
  }
  catch (error) {
    logger.error('Error starting the server', error);
    process.exit(1);
  }
};

startServer();