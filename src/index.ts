import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

// Infrastructure
import { logger, LogLevel } from './infra/logger';
import { mongoConnection } from './infra/db/mongodb';

// Repositories
import { ActivityRepositoryMongo } from './repositories/impl/activityRepositoryMongo';
import { InstanceRepositoryMongo } from './repositories/impl/instanceRepositoryMongo';
import { SubmissionRepositoryMongo } from './repositories/impl/submissionRepositoryMongo';
import { ConfigParamsSchemaRepositoryMongo } from './repositories/impl/paramSchemaRepositoryMongo';

// Services
import { ActivityService } from './services/activityService';

// Application (Facade)
import { ActivityFacade } from './application/activityFacade';

// API
import { configureRoutes } from './api/routes';
import { errorHandler, notFoundHandler, requestLogger } from './api/middleware/errorHandler';

// Configure logger
logger.setLevel(process.env.LOG_LEVEL === 'DEBUG' ? LogLevel.DEBUG : LogLevel.INFO);

/**
 * Initialize application dependencies
 */
function initializeDependencies() {
  // Use MongoDB repositories by default
  const activityRepository = new ActivityRepositoryMongo();
  const instanceRepository = new InstanceRepositoryMongo();
  const submissionRepository = new SubmissionRepositoryMongo();
  const configParamsSchemaRepository = new ConfigParamsSchemaRepositoryMongo();

  // Initialize services
  const activityService = new ActivityService(
    activityRepository,
    instanceRepository,
    submissionRepository,
    configParamsSchemaRepository
  );

  // Initialize Facade
  const activityFacade = new ActivityFacade(activityService);

  return { activityService, activityFacade };
}

/**
 * Create and configure Express app
 */
function createApp() {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // Initialize dependencies
  const { activityService, activityFacade } = initializeDependencies();

  // API Routes
  const apiRouter = configureRoutes(activityFacade, activityService);
  app.use('/api/v1', apiRouter);

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Redirect root to API documentation
  app.get('/', (req: Request, res: Response) => {
    res.redirect('/api-docs');
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      service: 'mrnewton-activity', 
      timestamp: new Date().toISOString(),
      mongodb: mongoConnection.isConnected() ? 'connected' : 'disconnected'
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
async function startServer() {
  const PORT = process.env.PORT || 5000;
  
  try {
    // Connect to MongoDB with mrnewton-activity database
    await mongoConnection.connect({ dbName: 'mrnewton-activity' });
    logger.info('MongoDB connected successfully');

    // Create and start Express app
    const app = createApp();
    
    app.listen(PORT, () => {
      logger.info(`MrNewton Activity Provider running on http://localhost:${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await mongoConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await mongoConnection.disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default createApp();
