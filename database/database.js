const { MongoClient } = require('mongodb');

let dbo;

const connectToDatabase = async () => {
    const url_mongodb = 'mongodb+srv://Huzair13:Huz%402002@cluster0.bioliew.mongodb.net/';

    try {
        const client = await MongoClient.connect(url_mongodb);
        dbo = client.db('Movies');
        console.log('Connected to the movies database');
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        throw error;
    }
};


const getDatabaseInstance = () => {
    if (!dbo) {
        throw new Error('Database not connected');
    }
    return dbo;
};

module.exports = { connectToDatabase, getDatabaseInstance };
