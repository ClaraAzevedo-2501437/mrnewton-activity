import { Request, Response, NextFunction } from 'express';
import { ActivityFacade } from '../../application/activityFacade';
import { ActivityService } from '../../services/activityService';
import { logger } from '../../infra/logger';

/**
 * InstanceController - Handles HTTP requests for deployment instances
 * Uses ActivityFacade as the single entry point
 */
export class InstanceController {
  constructor(
    private activityFacade: ActivityFacade,
    private activityService: ActivityService // Kept for operations not exposed in Facade
  ) {}

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

      // Create deployment instance via Facade
      const deployment = await this.activityFacade.createInstance(activity_id, session_params);

      res.status(201).json({
        instance_id: deployment.instanceId,
        activity_id: activity_id,
        deploy_url: deployment.url,
        expires_in_seconds: 604800, // 7 days in seconds
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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

      // Record submission via Facade
      await this.activityFacade.recordSubmission({
        instanceId: instance_id,
        studentId: student_id,
        attempts
      });

      // Retrieve the recorded submission to return details
      const submission = await this.activityService.getSubmissionByInstanceAndStudent(instance_id, student_id);
      
      if (!submission) {
        throw new Error('Submission was not saved correctly');
      }

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

  /**
   * GET /api/v1/submissions/instance/:instanceId/student/:studentId
   * Get submission for a specific student in an instance
   */
  public getSubmissionByInstanceAndStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { instanceId, studentId } = req.params;
      const submissions = await this.activityService.getSubmissionByInstanceAndStudent(instanceId, studentId);

      if (!submissions) {
        res.status(404).json({
          error: 'Not Found',
          message: `No submission found for instance ${instanceId} and student ${studentId}`
        });
        return;
      }

      res.status(200).json({
        submission_id: submissions.submissionId,
        instance_id: submissions.instanceId,
        student_id: submissions.studentId,
        number_of_attempts: submissions.numberOfAttempts,
        attempts: submissions.attempts,
        created_at: submissions.createdAt
      });
    } catch (error) {
      next(error);
    }
  };
}
