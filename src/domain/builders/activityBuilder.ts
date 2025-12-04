import { v4 as uuidv4 } from 'uuid';
import { Activity, ActivityConfig } from '../models/activity';
import { ValidationResult, ActivityValidators } from '../validators/activityValidators';
import { ValidationError } from '../errors/validationError';

/**
 * ActivityBuilder - The ONLY way to create Activity instances
 * Implements the Builder pattern with fluent API and comprehensive validation
 */
export class ActivityBuilder {
  private configData: Partial<ActivityConfig> = {};
  private defaults: Partial<ActivityConfig> = {};
  private overrides: Partial<ActivityConfig> = {};

  /**
   * Set configuration from JSON input
   */
  public withJson(json: any): this {
    if (json && typeof json === 'object') {
      this.configData = { ...json };
    }
    return this;
  }

  /**
   * Set default values (lowest priority)
   */
  public withDefaults(defaults: Partial<ActivityConfig>): this {
    this.defaults = { ...defaults };
    return this;
  }

  /**
   * Set override values (highest priority)
   */
  public withOverrides(overrides: Partial<ActivityConfig>): this {
    this.overrides = { ...overrides };
    return this;
  }

  /**
   * Validate the current configuration without building
   * Returns ValidationResult with all errors collected
   */
  public validate(): ValidationResult {
    const mergedConfig = this.mergeConfig();
    return ActivityValidators.validateActivityConfig(mergedConfig);
  }

  /**
   * Build and return an immutable Activity instance
   * Throws ValidationError if validation fails
   */
  public build(): Activity {
    const validationResult = this.validate();
    
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult);
    }

    const mergedConfig = this.mergeConfig() as ActivityConfig;
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    return new Activity(id, mergedConfig, createdAt);
  }

  /**
   * Safe build that returns either Activity or validation errors
   * Does not throw exceptions
   */
  public buildSafe(): { activity?: Activity; errors?: ValidationResult } {
    try {
      const activity = this.build();
      return { activity };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { errors: error.validationResult };
      }
      throw error; // Re-throw unexpected errors
    }
  }

  /**
   * Merge configuration with priority: overrides > configData > defaults
   */
  private mergeConfig(): Partial<ActivityConfig> {
    return {
      ...this.defaults,
      ...this.configData,
      ...this.overrides
    };
  }

  /**
   * Static factory method for convenience
   */
  public static create(): ActivityBuilder {
    return new ActivityBuilder();
  }
}
