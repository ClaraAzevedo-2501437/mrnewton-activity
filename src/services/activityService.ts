import { v4 as uuidv4 } from 'uuid';
import { Activity } from '../domain/models/activity';
import { DeploymentInstance } from '../domain/models/deploymentInstance';
import { Submission, AttemptResult } from '../domain/models/submission';
import { ConfigParamsSchema, ConfigParamDefinition } from '../domain/models/paramSchema';
import { ActivityBuilder } from '../domain/builders/activityBuilder';
import { IActivityRepository } from '../repositories/interfaces/IActivityRepository';
import { IInstanceRepository } from '../repositories/interfaces/IInstanceRepository';
import { ISubmissionRepository } from '../repositories/interfaces/ISubmissionRepository';
import { IConfigParamsSchemaRepository } from '../repositories/interfaces/IParamSchemaRepository';
import { NotFoundError } from '../common/errors';
import { generateInstanceId, calculateExpirationDate, calculateExpirationSeconds } from '../common/utils';
import { logger } from '../infra/logger';

/**
 * ActivityService - Business logic for activity management
 * Coordinates between domain models, builders, and repositories
 */
export class ActivityService {
  constructor(
    private activityRepository: IActivityRepository,
    private instanceRepository: IInstanceRepository,
    private submissionRepository: ISubmissionRepository,
    private configParamsSchemaRepository: IConfigParamsSchemaRepository
  ) {}

  /**
   * Create an Activity from JSON configuration
   * Uses ActivityBuilder to construct and validate
   */
  public async createFromJson(json: any): Promise<Activity> {
    logger.info('Creating activity from JSON configuration');

    // Use the Builder pattern to create and validate the activity
    const activity = ActivityBuilder.create()
      .withJson(json)
      .build(); // Will throw ValidationError if invalid

    // Persist the activity
    const savedActivity = await this.activityRepository.save(activity);
    
    logger.info(`Activity created successfully: ${savedActivity.id}`);
    return savedActivity;
  }

  /**
   * Create a deployment instance for an activity
   * Returns instance details with URL
   */
  public async createInstance(activityId: string, sessionParams?: Record<string, any>): Promise<{
    instanceId: string;
    activityId: string;
    deployUrl: string;
    expiresInSeconds: number;
    expiresAt: string;
  }> {
    logger.info(`Creating deployment instance for activity: ${activityId}`);

    // Verify activity exists
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError(`Activity not found: ${activityId}`);
    }

    // Generate instance details
    const instanceId = generateInstanceId();
    const createdAt = new Date().toISOString();
    const expiresAt = calculateExpirationDate(7); // 1 week expiration
    const deployUrl = `https://mrnewton.example.com/instances/${instanceId}`;

    // Create and save instance
    const instance = new DeploymentInstance(
      instanceId,
      activityId,
      createdAt,
      expiresAt,
      sessionParams
    );

    await this.instanceRepository.save(instance);

    logger.info(`Deployment instance created: ${instanceId}`);

    return {
      instanceId,
      activityId,
      deployUrl,
      expiresInSeconds: calculateExpirationSeconds(expiresAt),
      expiresAt
    };
  }

  /**
   * Record a student submission for an instance
   * The frontend calculates results and manages retries
   */
  public async recordSubmission(
    instanceId: string,
    studentId: string,
    attempts: AttemptResult[]
  ): Promise<Submission> {
    logger.info(`Recording submission for instance: ${instanceId}`);

    // Verify instance exists
    const instance = await this.instanceRepository.findById(instanceId);
    if (!instance) {
      throw new NotFoundError(`Deployment instance not found: ${instanceId}`);
    }

    // Create submission with data provided by frontend
    const submissionId = uuidv4();
    const createdAt = new Date().toISOString();
    
    const submission = new Submission(
      submissionId,
      instanceId,
      studentId,
      attempts.length,
      attempts,
      createdAt
    );

    // Save submission
    const savedSubmission = await this.submissionRepository.save(submission);
    
    logger.info(`Submission recorded: ${submissionId} for student: ${studentId} with ${attempts.length} attempt(s)`);
    return savedSubmission;
  }

  /**
   * Get activity by ID
   */
  public async getActivity(activityId: string): Promise<Activity> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError(`Activity not found: ${activityId}`);
    }
    return activity;
  }

  /**
   * Get instance by ID
   */
  public async getInstance(instanceId: string): Promise<DeploymentInstance> {
    const instance = await this.instanceRepository.findById(instanceId);
    if (!instance) {
      throw new NotFoundError(`Deployment instance not found: ${instanceId}`);
    }
    return instance;
  }

  /**
   * Get all instances for an activity
   */
  public async getInstancesForActivity(activityId: string): Promise<DeploymentInstance[]> {
    return await this.instanceRepository.findByActivityId(activityId);
  }

  /**
   * Get all submissions for an instance
   */
  public async getSubmissionsForInstance(instanceId: string): Promise<Submission[]> {
    return await this.submissionRepository.findByInstanceId(instanceId);
  }

  /**
   * Get submission for a specific student in an instance
   */
  public async getSubmissionByInstanceAndStudent(instanceId: string, studentId: string): Promise<Submission | null> {
    const submissions = await this.submissionRepository.findByInstanceId(instanceId);
    return submissions.find(sub => sub.studentId === studentId) || null;
  }

  /**
   * Get all activities
   */
  public async getAllActivities(): Promise<Activity[]> {
    return await this.activityRepository.findAll();
  }

  /**
   * Save parameter schema configuration
   */
  public async saveConfigParamsSchema(params: ConfigParamDefinition[]): Promise<ConfigParamsSchema> {
    logger.info('Saving parameter schema configuration');

    const id = uuidv4();
    const now = new Date().toISOString();
    
    const schema = new ConfigParamsSchema(id, params, now, now);
    const savedSchema = await this.configParamsSchemaRepository.save(schema);
    
    logger.info(`Parameter schema saved: ${savedSchema.id}`);
    return savedSchema;
  }

  /**
   * Get current parameter schema
   */
  public async getCurrentConfigParamsSchema(): Promise<ConfigParamsSchema | null> {
    return await this.configParamsSchemaRepository.getCurrent();
  }

  /**
   * Get all parameter schemas (history)
   */
  public async getAllConfigParamsSchemas(): Promise<ConfigParamsSchema[]> {
    return await this.configParamsSchemaRepository.findAll();
  }
}
