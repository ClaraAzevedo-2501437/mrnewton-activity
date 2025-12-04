import { Router } from 'express';
import { ActivityController } from './controllers/activityController';
import { InstanceController } from './controllers/instanceController';
import { ActivityService } from '../services/activityService';

/**
 * Configure API routes
 */
export function configureRoutes(activityService: ActivityService): Router {
  const router = Router();

  // Initialize controllers
  const activityController = new ActivityController(activityService);
  const instanceController = new InstanceController(activityService);

  // Activity configuration routes
  router.get('/config/params', activityController.getConfigParams);
  router.put('/config/params', activityController.updateConfigParams);
  router.post('/config', activityController.createConfig);
  router.get('/config/:activityId', activityController.getConfig);
  router.get('/config', activityController.getAllConfigs);

  // Deployment instance routes
  router.post('/deploy', instanceController.deploy);
  router.get('/deploy/:instanceId', instanceController.getInstance);
  router.get('/deploy/activity/:activityId', instanceController.getInstancesByActivity);

  // Submission routes
  router.post('/submissions', instanceController.recordSubmission);
  router.get('/submissions/instance/:instanceId', instanceController.getSubmissionsByInstance);

  return router;
}
