import { MongoClient, Db, GridFSBucket, MongoClientOptions } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let gridFSBucket: GridFSBucket | null = null;
let connectionPromise: Promise<Db> | null = null;

const poolOptions: MongoClientOptions = {
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '2', 10),
  maxIdleTimeMS: parseInt(process.env.MONGO_MAX_IDLE_TIME_MS || '30000', 10),
  waitQueueTimeoutMS: parseInt(process.env.MONGO_WAIT_QUEUE_TIMEOUT_MS || '10000', 10),
};

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  // Prevent race conditions when multiple calls happen simultaneously
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'ai_summit';

    client = new MongoClient(uri, poolOptions);
    await client.connect();
    db = client.db(dbName);
    gridFSBucket = new GridFSBucket(db, { bucketName: 'uploads' });

    return db;
  })();

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return db;
}

export function getGridFSBucket(): GridFSBucket {
  if (!gridFSBucket) {
    throw new Error('GridFS not initialized. Call connectToDatabase first.');
  }
  return gridFSBucket;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    gridFSBucket = null;
    connectionPromise = null;
  }
}
