import { Submission } from '../../domain/models/submission';

/**
 * ISubmissionRepository - Interface for Submission persistence
 * To be implemented in the future
 */
export interface ISubmissionRepository {
  /**
   * Save a student submission
   */
  save(submission: Submission): Promise<Submission>;

  /**
   * Find submission by ID
   */
  findById(submissionId: string): Promise<Submission | null>;

  /**
   * Find all submissions for a given instance
   */
  findByInstanceId(instanceId: string): Promise<Submission[]>;

  /**
   * Find all submissions
   */
  findAll(): Promise<Submission[]>;
}
