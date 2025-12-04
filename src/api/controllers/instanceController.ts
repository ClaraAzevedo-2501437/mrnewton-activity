import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../../services/activityService';
import { logger } from '../../infra/logger';

/**
 * InstanceController - Handles HTTP requests for deployment instances
 */
export class InstanceController {
  constructor(private activityService: ActivityService) {}

  /**
   * POST /api/v1/deploy
   * Create a deployment instance for an activity
   */
  public deploy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Received POST /api/v1/deploy request');
      
      const { activity_id, session_params } = req.body;

      if (!activity_id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'activity_id is required'
        });
        return;
      }

      // Create deployment instance
      const deployment = await this.activityService.createInstance(activity_id, session_params);

      res.status(201).json({
        instance_id: deployment.instanceId,
        activity_id: deployment.activityId,
        deploy_url: deployment.deployUrl,
        expires_in_seconds: deployment.expiresInSeconds,
        expires_at: deployment.expiresAt
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/deploy/:instanceId
   * Get deployment instance details
   */
  public getInstance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { instanceId } = req.params;
      const instance = await this.activityService.getInstance(instanceId);

      res.status(200).json({
        instance_id: instance.instanceId,
        activity_id: instance.activityId,
        created_at: instance.createdAt,
        expires_at: instance.expiresAt,
        session_params: instance.sessionParams
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/deploy/activity/:activityId
   * Get all instances for an activity
   */
  public getInstancesByActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { activityId } = req.params;
      const instances = await this.activityService.getInstancesForActivity(activityId);

      res.status(200).json({
        count: instances.length,
        instances: instances.map(instance => ({
          instance_id: instance.instanceId,
          activity_id: instance.activityId,
          created_at: instance.createdAt,
          expires_at: instance.expiresAt
        }))
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/submissions
   * Record a student submission with multiple attempts
   */
  public recordSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Received POST /api/v1/submissions request');
      
      const { instance_id, student_id, attempts } = req.body;

      if (!instance_id || !student_id || !attempts || !Array.isArray(attempts)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'instance_id, student_id, and attempts (array) are required'
        });
        return;
      }

      // Record submission
      const submission = await this.activityService.recordSubmission(
        instance_id,
        student_id,
        attempts
      );

      res.status(201).json({
        submission_id: submission.submissionId,
        instance_id: submission.instanceId,
        student_id: submission.studentId,
        number_of_attempts: submission.numberOfAttempts,
        attempts: submission.attempts,
        created_at: submission.createdAt
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/submissions/instance/:instanceId
   * Get all submissions for an instance
   */
  public getSubmissionsByInstance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { instanceId } = req.params;
      const submissions = await this.activityService.getSubmissionsForInstance(instanceId);

      res.status(200).json({
        count: submissions.length,
        submissions: submissions.map(submission => ({
          submission_id: submission.submissionId,
          instance_id: submission.instanceId,
          student_id: submission.studentId,
          number_of_attempts: submission.numberOfAttempts,
          attempts: submission.attempts,
          created_at: submission.createdAt
        }))
      });
    } catch (error) {
      next(error);
    }
  };
}
