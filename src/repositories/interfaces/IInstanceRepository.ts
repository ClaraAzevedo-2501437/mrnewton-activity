import { DeploymentInstance } from '../../domain/models/deploymentInstance';

/**
 * IInstanceRepository - Interface for DeploymentInstance persistence
 */
export interface IInstanceRepository {
  /**
   * Save a deployment instance
   */
  save(instance: DeploymentInstance): Promise<DeploymentInstance>;

  /**
   * Find instance by ID
   */
  findById(instanceId: string): Promise<DeploymentInstance | null>;

  /**
   * Find all instances for a given activity
   */
  findByActivityId(activityId: string): Promise<DeploymentInstance[]>;

  /**
   * Find all instances
   */
  findAll(): Promise<DeploymentInstance[]>;

  /**
   * Delete instance by ID
   */
  delete(instanceId: string): Promise<boolean>;

  /**
   * Check if instance exists
   */
  exists(instanceId: string): Promise<boolean>;
}
