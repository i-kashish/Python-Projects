const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
    try {
        let dbUrl = process.env.MONGODB_URI;

        if (process.env.NODE_ENV === 'development' || !dbUrl || dbUrl.includes('cluster0.mongodb.net')) {
            console.log('Starting In-Memory MongoDB Server...');
            mongod = await MongoMemoryServer.create();
            dbUrl = mongod.getUri();
            console.log('In-Memory MongoDB Server started');
        }

        const conn = await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        if (mongod) {
            await mongod.stop();
        }
    } catch (error) {
        console.error(`Error disconnecting: ${error.message}`);
    }
};

module.exports = { connectDB, disconnectDB };
