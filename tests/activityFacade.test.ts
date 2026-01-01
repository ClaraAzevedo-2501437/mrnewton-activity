import { ActivityFacade, SubmissionDTO } from '../src/application/activityFacade';
import { ActivityService } from '../src/services/activityService';
import { Activity } from '../src/domain/models/activity';
import { Submission, AttemptResult } from '../src/domain/models/submission';
import { DeploymentInstance } from '../src/domain/models/deploymentInstance';
import { NotFoundError } from '../src/common/errors';

/**
 * Unit tests for ActivityFacade
 * Verify that Facade delegates correctly without implementing business logic
 */
describe('ActivityFacade', () => {
  let activityFacade: ActivityFacade;
  let mockActivityService: jest.Mocked<ActivityService>;

  // Test data
  const mockActivity: Activity = new Activity(
    'activity-123',
    {
      title: 'Test Quiz',
      grade: 10,
      modules: 'Math',
      number_of_exercises: 5,
      total_time_minutes: 30,
      number_of_retries: 2,
      exercises: [
        {
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correct_options: 'B',
          correct_answer: '4'
        }
      ]
    },
    '2026-01-01T10:00:00Z'
  );

  const mockDeploymentResponse = {
    instanceId: 'instance-456',
    activityId: 'activity-123',
    deployUrl: 'https://mrnewton.example.com/instances/instance-456',
    expiresInSeconds: 604800,
    expiresAt: '2026-01-08T10:00:00Z'
  };

  const mockDeploymentInstance: DeploymentInstance = new DeploymentInstance(
    'instance-456',
    'activity-123',
    '2026-01-01T10:00:00Z',
    '2026-01-08T10:00:00Z',
    {}
  );

  const mockAttempts: AttemptResult[] = [
    {
      attemptIndex: 1,
      answers: {
        'q1': { selectedOption: 'B', rationale: 'Because 2+2=4' }
      },
      result: 100,
      submittedAt: '2026-01-01T10:30:00Z',
      timeSpentSeconds: 120
    }
  ];

  const mockSubmission: Submission = new Submission(
    'submission-789',
    'instance-456',
    'student-001',
    1,
    mockAttempts,
    '2026-01-01T10:30:00Z'
  );

  beforeEach(() => {
    // Create mock service with all required methods
    mockActivityService = {
      createFromJson: jest.fn(),
      getActivity: jest.fn(),
      createInstance: jest.fn(),
      recordSubmission: jest.fn(),
      getInstancesForActivity: jest.fn(),
      getSubmissionsForInstance: jest.fn(),
      getInstance: jest.fn(),
      getSubmissionByInstanceAndStudent: jest.fn(),
      getAllActivities: jest.fn(),
      saveConfigParamsSchema: jest.fn(),
      getCurrentConfigParamsSchema: jest.fn(),
      getAllConfigParamsSchemas: jest.fn()
    } as any;

    // Initialize Facade with mocked service
    activityFacade = new ActivityFacade(mockActivityService);
  });

  describe('createActivity', () => {
    it('should delegate to ActivityService.createFromJson', async () => {
      const json = { title: 'Test Quiz', grade: 10 };
      mockActivityService.createFromJson.mockResolvedValue(mockActivity);

      const result = await activityFacade.createActivity(json);

      expect(mockActivityService.createFromJson).toHaveBeenCalledWith(json);
      expect(mockActivityService.createFromJson).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockActivity);
    });

    it('should propagate errors from ActivityService', async () => {
      const json = { invalid: 'data' };
      const error = new Error('Validation failed');
      mockActivityService.createFromJson.mockRejectedValue(error);

      await expect(activityFacade.createActivity(json)).rejects.toThrow('Validation failed');
      expect(mockActivityService.createFromJson).toHaveBeenCalledWith(json);
    });
  });

  describe('getActivity', () => {
    it('should delegate to ActivityService.getActivity', async () => {
      const activityId = 'activity-123';
      mockActivityService.getActivity.mockResolvedValue(mockActivity);

      const result = await activityFacade.getActivity(activityId);

      expect(mockActivityService.getActivity).toHaveBeenCalledWith(activityId);
      expect(mockActivityService.getActivity).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockActivity);
    });

    it('should return null when activity is not found', async () => {
      const activityId = 'non-existent';
      const notFoundError = new NotFoundError('Activity not found');
      mockActivityService.getActivity.mockRejectedValue(notFoundError);

      const result = await activityFacade.getActivity(activityId);

      expect(result).toBeNull();
      expect(mockActivityService.getActivity).toHaveBeenCalledWith(activityId);
    });

    it('should propagate non-NotFoundError errors', async () => {
      const activityId = 'activity-123';
      const error = new Error('Database connection failed');
      mockActivityService.getActivity.mockRejectedValue(error);

      await expect(activityFacade.getActivity(activityId)).rejects.toThrow('Database connection failed');
    });
  });

  describe('createInstance', () => {
    it('should delegate to ActivityService.createInstance and return simplified response', async () => {
      const activityId = 'activity-123';
      mockActivityService.createInstance.mockResolvedValue(mockDeploymentResponse);

      const result = await activityFacade.createInstance(activityId);

      expect(mockActivityService.createInstance).toHaveBeenCalledWith(activityId, undefined);
      expect(mockActivityService.createInstance).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        instanceId: 'instance-456',
        url: 'https://mrnewton.example.com/instances/instance-456'
      });
    });

    it('should pass session parameters to ActivityService', async () => {
      const activityId = 'activity-123';
      const sessionParams = { userId: 'user-123', cohort: 'A' };
      mockActivityService.createInstance.mockResolvedValue(mockDeploymentResponse);

      await activityFacade.createInstance(activityId, sessionParams);

      expect(mockActivityService.createInstance).toHaveBeenCalledWith(activityId, sessionParams);
    });

    it('should propagate errors from ActivityService', async () => {
      const activityId = 'non-existent';
      const error = new NotFoundError('Activity not found');
      mockActivityService.createInstance.mockRejectedValue(error);

      await expect(activityFacade.createInstance(activityId)).rejects.toThrow('Activity not found');
    });
  });

  describe('recordSubmission', () => {
    it('should delegate to ActivityService.recordSubmission', async () => {
      const payload: SubmissionDTO = {
        instanceId: 'instance-456',
        studentId: 'student-001',
        attempts: mockAttempts
      };
      mockActivityService.recordSubmission.mockResolvedValue(mockSubmission);

      await activityFacade.recordSubmission(payload);

      expect(mockActivityService.recordSubmission).toHaveBeenCalledWith(
        'instance-456',
        'student-001',
        mockAttempts
      );
      expect(mockActivityService.recordSubmission).toHaveBeenCalledTimes(1);
    });

    it('should not return submission data (void method)', async () => {
      const payload: SubmissionDTO = {
        instanceId: 'instance-456',
        studentId: 'student-001',
        attempts: mockAttempts
      };
      mockActivityService.recordSubmission.mockResolvedValue(mockSubmission);

      const result = await activityFacade.recordSubmission(payload);

      expect(result).toBeUndefined();
    });

    it('should propagate errors from ActivityService', async () => {
      const payload: SubmissionDTO = {
        instanceId: 'non-existent',
        studentId: 'student-001',
        attempts: mockAttempts
      };
      const error = new NotFoundError('Instance not found');
      mockActivityService.recordSubmission.mockRejectedValue(error);

      await expect(activityFacade.recordSubmission(payload)).rejects.toThrow('Instance not found');
    });
  });

  describe('getSubmissionsByActivity', () => {
    it('should retrieve instances and aggregate submissions', async () => {
      const activityId = 'activity-123';
      const instances = [
        mockDeploymentInstance,
        new DeploymentInstance('instance-789', 'activity-123', '2026-01-02T10:00:00Z', '2026-01-09T10:00:00Z', {})
      ];

      const submission1 = mockSubmission;
      const submission2 = new Submission(
        'submission-999',
        'instance-789',
        'student-002',
        1,
        mockAttempts,
        '2026-01-02T11:00:00Z'
      );

      mockActivityService.getInstancesForActivity.mockResolvedValue(instances);
      mockActivityService.getSubmissionsForInstance
        .mockResolvedValueOnce([submission1])
        .mockResolvedValueOnce([submission2]);

      const result = await activityFacade.getSubmissionsByActivity(activityId);

      expect(mockActivityService.getInstancesForActivity).toHaveBeenCalledWith(activityId);
      expect(mockActivityService.getSubmissionsForInstance).toHaveBeenCalledWith('instance-456');
      expect(mockActivityService.getSubmissionsForInstance).toHaveBeenCalledWith('instance-789');
      expect(result).toEqual([submission1, submission2]);
    });

    it('should return empty array when no instances exist', async () => {
      const activityId = 'activity-123';
      mockActivityService.getInstancesForActivity.mockResolvedValue([]);

      const result = await activityFacade.getSubmissionsByActivity(activityId);

      expect(result).toEqual([]);
      expect(mockActivityService.getSubmissionsForInstance).not.toHaveBeenCalled();
    });

    it('should handle instances with no submissions', async () => {
      const activityId = 'activity-123';
      mockActivityService.getInstancesForActivity.mockResolvedValue([mockDeploymentInstance]);
      mockActivityService.getSubmissionsForInstance.mockResolvedValue([]);

      const result = await activityFacade.getSubmissionsByActivity(activityId);

      expect(result).toEqual([]);
    });

    it('should propagate errors from ActivityService', async () => {
      const activityId = 'activity-123';
      const error = new Error('Database error');
      mockActivityService.getInstancesForActivity.mockRejectedValue(error);

      await expect(activityFacade.getSubmissionsByActivity(activityId)).rejects.toThrow('Database error');
    });
  });

  describe('Facade architecture constraints', () => {
    it('should not contain business logic', () => {
      // Verify Facade methods are thin wrappers
      const facadeSource = activityFacade.constructor.toString();
      
      // Facade should not contain complex validation logic
      expect(facadeSource).not.toMatch(/if.*validate/i);
      expect(facadeSource).not.toMatch(/switch.*case/i);
    });

    it('should only depend on ActivityService', () => {
      // Verify Facade constructor only receives ActivityService
      const constructor = activityFacade.constructor;
      expect(constructor.length).toBe(1);
    });
  });
});
