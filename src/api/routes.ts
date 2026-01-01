import { Router } from 'express';
import { ActivityController } from './controllers/activityController';
import { InstanceController } from './controllers/instanceController';
import { ActivityFacade } from '../application/activityFacade';
import { ActivityService } from '../services/activityService';

/**
 * Configure API routes
 * Controllers use the ActivityFacade as the single entry point
 */
export function configureRoutes(
  activityFacade: ActivityFacade,
  activityService: ActivityService
): Router {
  const router = Router();

  // Initialize controllers with Facade and Service
  const activityController = new ActivityController(activityFacade, activityService);
  const instanceController = new InstanceController(activityFacade, activityService);

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
  router.get('/submissions/instance/:instanceId/student/:studentId', instanceController.getSubmissionByInstanceAndStudent);

  return router;
}
