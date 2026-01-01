import { Activity } from '../domain/models/activity';
import { Submission, AttemptResult } from '../domain/models/submission';
import { ActivityService } from '../services/activityService';
import { logger } from '../infra/logger';

/**
 * SubmissionDTO - Data Transfer Object for recording submissions
 */
export interface SubmissionDTO {
  instanceId: string;
  studentId: string;
  attempts: AttemptResult[];
}

/**
 * ActivityFacade - Single entry point for the Activity component
 * 
 * This Facade provides a simplified, stable interface that hides internal complexity.
 * It orchestrates existing services without implementing business logic.
 * 
 * Responsibilities:
 * - Create activities from JSON configuration
 * - Retrieve activity definitions
 * - Create deployment instances
 * - Record student submissions
 * - Expose read-only access to submissions (for Analytics)
 * 
 * Design Notes:
 * - Delegates all operations to ActivityService
 * - Does not contain validation or business rules
 * - Propagates errors from services as-is
 * - Acts as the stable contract for external consumers
 */
export class ActivityFacade {
  constructor(
    private readonly activityService: ActivityService
  ) {
    logger.info('ActivityFacade initialized');
  }

  /**
   * Create an activity from JSON configuration
   * Delegates to ActivityService and the Builder
   * 
   * @param json - Activity configuration in JSON format
   * @returns Promise<Activity> - The created activity
   * @throws ValidationError if the configuration is invalid
   */
  public async createActivity(json: any): Promise<Activity> {
    logger.debug('Facade: Creating activity from JSON');
    return await this.activityService.createFromJson(json);
  }

  /**
   * Retrieve an activity by ID
   * 
   * @param activityId - The unique identifier of the activity
   * @returns Promise<Activity | null> - The activity or null if not found
   */
  public async getActivity(activityId: string): Promise<Activity | null> {
    logger.debug(`Facade: Retrieving activity ${activityId}`);
    try {
      return await this.activityService.getActivity(activityId);
    } catch (error) {
      // If NotFoundError, return null instead of throwing
      if ((error as any).name === 'NotFoundError') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a deployment instance for an activity
   * Generates instanceId and deployment URL
   * 
   * @param activityId - The activity to deploy
   * @param sessionParams - Optional session-specific parameters
   * @returns Promise with instanceId and url
   * @throws NotFoundError if activity doesn't exist
   */
  public async createInstance(
    activityId: string,
    sessionParams?: Record<string, any>
  ): Promise<{ instanceId: string; url: string }> {
    logger.debug(`Facade: Creating instance for activity ${activityId}`);
    
    const deployment = await this.activityService.createInstance(activityId, sessionParams);
    
    return {
      instanceId: deployment.instanceId,
      url: deployment.deployUrl
    };
  }

  /**
   * Record a student submission
   * Stores the submission data provided by the frontend
   * 
   * @param payload - Submission data with instanceId, studentId, and attempts
   * @returns Promise<void>
   * @throws NotFoundError if instance doesn't exist
   */
  public async recordSubmission(payload: SubmissionDTO): Promise<void> {
    logger.debug(`Facade: Recording submission for instance ${payload.instanceId}`);
    
    await this.activityService.recordSubmission(
      payload.instanceId,
      payload.studentId,
      payload.attempts
    );
  }

  /**
   * Get all submissions for an activity
   * Used by Analytics component to retrieve submission data
   * 
   * @param activityId - The activity identifier
   * @returns Promise<Submission[]> - Array of submissions
   */
  public async getSubmissionsByActivity(activityId: string): Promise<Submission[]> {
    logger.debug(`Facade: Retrieving submissions for activity ${activityId}`);
    
    // Get all instances for the activity
    const instances = await this.activityService.getInstancesForActivity(activityId);
    
    // Get submissions for each instance
    const submissionPromises = instances.map(instance =>
      this.activityService.getSubmissionsForInstance(instance.instanceId)
    );
    
    const submissionArrays = await Promise.all(submissionPromises);
    
    // Flatten the array of arrays
    return submissionArrays.flat();
  }
}
