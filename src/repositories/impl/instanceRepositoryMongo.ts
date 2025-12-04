import { Collection } from 'mongodb';
import { DeploymentInstance } from '../../domain/models/deploymentInstance';
import { IInstanceRepository } from '../interfaces/IInstanceRepository';
import { mongoConnection } from '../../infra/db/mongodb';

/**
 * InstanceRepositoryMongo - MongoDB implementation of IInstanceRepository
 */
export class InstanceRepositoryMongo implements IInstanceRepository {
  private getCollection(): Collection {
    return mongoConnection.getDb().collection('quizInstances');
  }

  public async save(instance: DeploymentInstance): Promise<DeploymentInstance> {
    const collection = this.getCollection();
    
    const doc = {
      _id: instance.instanceId,
      instanceId: instance.instanceId,
      activityId: instance.activityId,
      createdAt: instance.createdAt,
      expiresAt: instance.expiresAt,
      sessionParams: instance.sessionParams
    };

    await collection.updateOne(
      { _id: instance.instanceId } as any,
      { $set: doc },
      { upsert: true }
    );

    return instance;
  }

  public async findById(instanceId: string): Promise<DeploymentInstance | null> {
    const collection = this.getCollection();
    const doc = await collection.findOne({ _id: instanceId } as any);

    if (!doc) {
      return null;
    }

    return new DeploymentInstance(
      String(doc.instanceId),
      String(doc.activityId),
      String(doc.createdAt),
      String(doc.expiresAt),
      doc.sessionParams as Record<string, any>
    );
  }

  public async findByActivityId(activityId: string): Promise<DeploymentInstance[]> {
    const collection = this.getCollection();
    const docs = await collection.find({ activityId }).toArray();

    return docs.map(doc => new DeploymentInstance(
      String(doc.instanceId),
      String(doc.activityId),
      String(doc.createdAt),
      String(doc.expiresAt),
      doc.sessionParams as Record<string, any>
    ));
  }

  public async findAll(): Promise<DeploymentInstance[]> {
    const collection = this.getCollection();
    const docs = await collection.find({}).toArray();

    return docs.map(doc => new DeploymentInstance(
      String(doc.instanceId),
      String(doc.activityId),
      String(doc.createdAt),
      String(doc.expiresAt),
      doc.sessionParams as Record<string, any>
    ));
  }

  public async delete(instanceId: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ _id: instanceId } as any);
    return result.deletedCount > 0;
  }

  public async exists(instanceId: string): Promise<boolean> {
    const collection = this.getCollection();
    const count = await collection.countDocuments({ _id: instanceId } as any);
    return count > 0;
  }
}
