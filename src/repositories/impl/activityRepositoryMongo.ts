import { Collection } from 'mongodb';
import { Activity, ActivityConfig } from '../../domain/models/activity';
import { IActivityRepository } from '../interfaces/IActivityRepository';
import { mongoConnection } from '../../infra/db/mongodb';

/**
 * ActivityRepositoryMongo - MongoDB implementation of IActivityRepository
 */
export class ActivityRepositoryMongo implements IActivityRepository {
  private getCollection(): Collection {
    return mongoConnection.getDb().collection('quizzes');
  }

  public async save(activity: Activity): Promise<Activity> {
    const collection = this.getCollection();
    
    const doc = {
      _id: activity.id,
      id: activity.id,
      cfg: activity.cfg,
      createdAt: activity.createdAt
    };

    await collection.updateOne(
      { _id: activity.id } as any,
      { $set: doc },
      { upsert: true }
    );

    return activity;
  }

  public async findById(id: string): Promise<Activity | null> {
    const collection = this.getCollection();
    const doc = await collection.findOne({ _id: id } as any);

    if (!doc) {
      return null;
    }

    return new Activity(
      String(doc.id),
      doc.cfg as ActivityConfig,
      String(doc.createdAt)
    );
  }

  public async findAll(): Promise<Activity[]> {
    const collection = this.getCollection();
    const docs = await collection.find({}).toArray();

    return docs.map(doc => new Activity(
      String(doc.id),
      doc.cfg as ActivityConfig,
      String(doc.createdAt)
    ));
  }

  public async delete(id: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ _id: id } as any);
    return result.deletedCount > 0;
  }

  public async exists(id: string): Promise<boolean> {
    const collection = this.getCollection();
    const count = await collection.countDocuments({ _id: id } as any);
    return count > 0;
  }
}
