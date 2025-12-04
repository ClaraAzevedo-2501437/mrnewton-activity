import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../../services/activityService';
import { ValidationError } from '../../domain/errors/validationError';
import { logger } from '../../infra/logger';

/**
 * ActivityController - Handles HTTP requests for activity configuration
 */
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  /**
   * GET /api/v1/config/params
   * Returns the schema/parameters for activity configuration
   * Retrieves from database
   */
  public getConfigParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current schema from database
      const schema = await this.activityService.getCurrentConfigParamsSchema();

      if (schema) {
        res.status(200).json({ params: schema.params });
      } else {
        res.status(404).json({
          error: 'Not Found',
          message: 'No parameter schema found. Please create one using PUT /api/v1/config/params'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/config/params
   * Update the parameter schema configuration
   */
  public updateConfigParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Received PUT /api/v1/config/params request');
      
      const { params } = req.body;

      if (!params || !Array.isArray(params)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'params array is required'
        });
        return;
      }

      // Save the new parameter schema
      const schema = await this.activityService.saveConfigParamsSchema(params);

      res.status(200).json({
        message: 'Parameter schema updated successfully',
        schema_id: schema.id,
        updated_at: schema.updatedAt,
        params: schema.params
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/config
   * Create a new activity configuration
   */
  public createConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Received POST /api/v1/config request');
      
      const config = req.body;
      
      // Use the service to create the activity (which uses the Builder)
      const activity = await this.activityService.createFromJson(config);

      // Return the created activity
      res.status(201).json({
        activity_id: activity.id,
        created_at: activity.createdAt,
        ...activity.cfg
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        // Transform validation errors into API response format
        const errorMessages = Object.entries(error.validationResult.errors)
          .flatMap(([field, messages]) => messages);
        
        res.status(400).json({
          error: 'Erro na validação dos dados',
          details: errorMessages
        });
        return;
      }
      next(error);
    }
  };

  /**
   * GET /api/v1/config/:activityId
   * Get activity configuration by ID
   */
  public getConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { activityId } = req.params;
      const activity = await this.activityService.getActivity(activityId);

      res.status(200).json({
        activity_id: activity.id,
        created_at: activity.createdAt,
        ...activity.cfg
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/config
   * Get all activities
   */
  public getAllConfigs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activities = await this.activityService.getAllActivities();

      res.status(200).json({
        count: activities.length,
        activities: activities.map(activity => ({
          activity_id: activity.id,
          created_at: activity.createdAt,
          title: activity.cfg.title,
          grade: activity.cfg.grade,
          number_of_exercises: activity.cfg.number_of_exercises
        }))
      });
    } catch (error) {
      next(error);
    }
  };
}
