import { Activity } from '../../domain/models/activity';

/**
 * IActivityRepository - Interface for Activity persistence
 */
export interface IActivityRepository {
  /**
   * Save an activity definition
   */
  save(activity: Activity): Promise<Activity>;

  /**
   * Find activity by ID
   */
  findById(id: string): Promise<Activity | null>;

  /**
   * Find all activities
   */
  findAll(): Promise<Activity[]>;

  /**
   * Delete activity by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if activity exists
   */
  exists(id: string): Promise<boolean>;
}
