import { Collection } from 'mongodb';
import { Submission } from '../../domain/models/submission';
import { ISubmissionRepository } from '../interfaces/ISubmissionRepository';
import { mongoConnection } from '../../infra/db/mongodb';

/**
 * SubmissionRepositoryMongo - MongoDB implementation of ISubmissionRepository
 */
export class SubmissionRepositoryMongo implements ISubmissionRepository {
  private getCollection(): Collection {
    return mongoConnection.getDb().collection('responses');
  }

  public async save(submission: Submission): Promise<Submission> {
    const collection = this.getCollection();
    
    const doc = {
      _id: submission.submissionId,
      submissionId: submission.submissionId,
      instanceId: submission.instanceId,
      studentId: submission.studentId,
      numberOfAttempts: submission.numberOfAttempts,
      attempts: submission.attempts,
      createdAt: submission.createdAt
    };

    await collection.updateOne(
      { _id: submission.submissionId } as any,
      { $set: doc },
      { upsert: true }
    );

    return submission;
  }

  public async findById(submissionId: string): Promise<Submission | null> {
    const collection = this.getCollection();
    const doc = await collection.findOne({ _id: submissionId } as any);

    if (!doc) {
      return null;
    }

    return new Submission(
      String(doc.submissionId),
      String(doc.instanceId),
      String(doc.studentId),
      Number(doc.numberOfAttempts),
      doc.attempts as any[],
      String(doc.createdAt)
    );
  }

  public async findByInstanceId(instanceId: string): Promise<Submission[]> {
    const collection = this.getCollection();
    const docs = await collection.find({ instanceId }).toArray();

    return docs.map(doc => new Submission(
      String(doc.submissionId),
      String(doc.instanceId),
      String(doc.studentId),
      Number(doc.numberOfAttempts),
      doc.attempts as any[],
      String(doc.createdAt)
    ));
  }

  public async findAll(): Promise<Submission[]> {
    const collection = this.getCollection();
    const docs = await collection.find({}).toArray();

    return docs.map(doc => new Submission(
      String(doc.submissionId),
      String(doc.instanceId),
      String(doc.studentId),
      Number(doc.numberOfAttempts),
      doc.attempts as any[],
      String(doc.createdAt)
    ));
  }

  public async delete(submissionId: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ _id: submissionId } as any);
    return result.deletedCount > 0;
  }
}
