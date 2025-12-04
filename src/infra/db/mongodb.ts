import { MongoClient, Db } from 'mongodb';
import { logger } from '../logger';

/**
 * MongoDB connection configuration and management
 */

export interface MongoConfig {
  url: string;
  dbName: string;
}

class MongoConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: MongoConfig = {
    url: process.env.MONGODB_URL || 'mongodb+srv://user-mrnewton:4cVtjvdfqW26Hst3@cluster0.nui5rqk.mongodb.net/?appName=Cluster0',
    dbName: process.env.MONGODB_DB_NAME || 'mrnewton-activity'
  };

  /**
   * Initialize MongoDB connection
   */
  public async connect(config?: Partial<MongoConfig>): Promise<void> {
    if (this.client) {
      logger.info('MongoDB already connected');
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    try {
      // Redact password from URL for logging
      const urlForLogging = this.config.url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
      logger.info(`Connecting to MongoDB at ${urlForLogging}...`);
      this.client = new MongoClient(this.config.url);
      await this.client.connect();
      this.db = this.client.db(this.config.dbName);
      logger.info(`Connected to MongoDB database: ${this.config.dbName}`);
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  public getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get the client instance
   */
  public getClient(): MongoClient {
    if (!this.client) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }

  /**
   * Close the connection
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      logger.info('Disconnected from MongoDB');
    }
  }
}

export const mongoConnection = new MongoConnection();
