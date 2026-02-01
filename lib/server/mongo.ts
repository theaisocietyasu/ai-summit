import { Db, MongoClient, MongoClientOptions } from "mongodb";

const poolOptions: MongoClientOptions = {
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || "10", 10),
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || "2", 10),
  maxIdleTimeMS: parseInt(process.env.MONGO_MAX_IDLE_TIME_MS || "30000", 10),
  waitQueueTimeoutMS: parseInt(
    process.env.MONGO_WAIT_QUEUE_TIMEOUT_MS || "10000",
    10,
  ),
};

declare global {
  // eslint-disable-next-line no-var
  var __aiSummitMongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient(): Promise<MongoClient> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!global.__aiSummitMongoClientPromise) {
    const client = new MongoClient(mongoUri, poolOptions);
    global.__aiSummitMongoClientPromise = client.connect();
  }

  return global.__aiSummitMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const dbName = process.env.DB_NAME || "ai_summit";
  return client.db(dbName);
}
