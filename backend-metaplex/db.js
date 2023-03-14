const MongoClient = require('mongodb').MongoClient;
const mongo_url = process.env.MONOG_URL

let db;

const loadDB = async () => {
  if (db) {
      return db;
  }
  try {
      const client = await MongoClient.connect(mongo_url);
      db = client.db('solRts');
  } catch (err) {
    console.error(err)
    throw("Mongo Raised Error!")
  }
  return db;
};

module.exports = { loadDB }