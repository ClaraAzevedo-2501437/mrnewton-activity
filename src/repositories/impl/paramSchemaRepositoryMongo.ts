import { Collection, Db } from 'mongodb';
import { ConfigParamsSchema, ConfigParamDefinition } from '../../domain/models/paramSchema';
import { IConfigParamsSchemaRepository } from '../interfaces/IParamSchemaRepository';
import { mongoConnection } from '../../infra/db/mongodb';
import { logger } from '../../infra/logger';

/**
 * ConfigParamsSchemaRepositoryMongo - MongoDB implementation for ConfigParamsSchema
 */
export class ConfigParamsSchemaRepositoryMongo implements IConfigParamsSchemaRepository {
  private collectionName = 'configParamsSchemas';

  private getCollection(): Collection {
    const db: Db = mongoConnection.getDb();
    return db.collection(this.collectionName);
  }

  public async save(schema: ConfigParamsSchema): Promise<ConfigParamsSchema> {
    try {
      const collection = this.getCollection();
      
      const doc = {
        _id: schema.id as any, // Use string ID
        params: schema.params,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt,
        isCurrent: true // Mark as current/active schema
      };

      // Set all existing schemas as not current
      await collection.updateMany(
        { isCurrent: true },
        { $set: { isCurrent: false } }
      );

      // Insert or update the new schema
      await collection.updateOne(
        { _id: schema.id as any },
        { $set: doc },
        { upsert: true }
      );

      logger.info(`Parameter schema saved: ${schema.id}`);
      return schema;
    } catch (error) {
      logger.error('Failed to save parameter schema', error);
      throw error;
    }
  }

  public async getCurrent(): Promise<ConfigParamsSchema | null> {
    try {
      const collection = this.getCollection();
      const doc = await collection.findOne({ isCurrent: true });

      if (!doc) {
        return null;
      }

      return new ConfigParamsSchema(
        String(doc._id),
        doc.params as ConfigParamDefinition[],
        doc.createdAt as string,
        doc.updatedAt as string
      );
    } catch (error) {
      logger.error('Failed to get current parameter schema', error);
      throw error;
    }
  }

  public async findById(id: string): Promise<ConfigParamsSchema | null> {
    try {
      const collection = this.getCollection();
      const doc = await collection.findOne({ _id: id as any });

      if (!doc) {
        return null;
      }

      return new ConfigParamsSchema(
        String(doc._id),
        doc.params as ConfigParamDefinition[],
        doc.createdAt as string,
        doc.updatedAt as string
      );
    } catch (error) {
      logger.error('Failed to find parameter schema by ID', error);
      throw error;
    }
  }

  public async findAll(): Promise<ConfigParamsSchema[]> {
    try {
      const collection = this.getCollection();
      const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();

      return docs.map(
        doc =>
          new ConfigParamsSchema(
            String(doc._id),
            doc.params as ConfigParamDefinition[],
            doc.createdAt as string,
            doc.updatedAt as string
          )
      );
    } catch (error) {
      logger.error('Failed to find all parameter schemas', error);
      throw error;
    }
  }
}
