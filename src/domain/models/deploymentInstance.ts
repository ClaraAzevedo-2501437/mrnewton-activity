/**
 * DeploymentInstance - Lightweight object referencing the Activity
 */
export class DeploymentInstance {
  public readonly instanceId: string;
  public readonly activityId: string;
  public readonly createdAt: string;
  public readonly expiresAt?: string;
  public readonly sessionParams?: Record<string, any>;

  constructor(
    instanceId: string,
    activityId: string,
    createdAt: string,
    expiresAt?: string,
    sessionParams?: Record<string, any>
  ) {
    this.instanceId = instanceId;
    this.activityId = activityId;
    this.createdAt = createdAt;
    this.expiresAt = expiresAt;
    this.sessionParams = sessionParams ? { ...sessionParams } : undefined;
    Object.freeze(this);
  }

  public toJSON(): Record<string, any> {
    return {
      instanceId: this.instanceId,
      activityId: this.activityId,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      sessionParams: this.sessionParams
    };
  }
}
