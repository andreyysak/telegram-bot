import { MongoClient } from "mongodb"

const url = process.env.MONGO_DB_URL

if (!url) throw new Error('MongoDB url was not found.')

const mongo_client = new MongoClient(url)

let db_client

export async function connectToMongoDB() {
  try {
    await mongo_client.connect()
    console.log('✅ Підключено до MongoDB')
    db_client = mongo_client.db('dashboard')
    return db_client
  } catch (e) {
    console.error('❌ Не вдалося підключитись до MongoDB', e);
    await mongo_client.close();
    throw e;
  }
}

export async function getDb() {
  const db = await connectToMongoDB();
  return db.collection('Todo');
}

