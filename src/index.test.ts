import request from 'supertest';
import app from './index';

describe('MrNewton Activity API Tests', () => {
  describe('GET /api/v1/config/params', () => {
    it('should return 200 and application/json content-type', async () => {
      const response = await request(app).get('/api/v1/config/params');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('params');
      expect(Array.isArray(response.body.params)).toBe(true);
    });
  });

  describe('POST /api/v1/config', () => {
    it('should return 201 with valid configuration', async () => {
      const validConfig = {
        title: 'Exame de Física - Treino',
        grade: 12,
        modules: ['Forças', 'Ondas'],
        number_of_exercises: 3,
        total_time_minutes: 90,
        number_of_retries: 2,
        show_answers_after_submission: true,
        scoring_policy: 'linear',
        approval_threshold: 0.6,
        exercises: [
          {
            question: 'Um bloco desliza ...',
            options: ['F = m*a', 'E = m*c^2'],
            correct_options: ['F = m*a'],
            correct_answer: '12.5'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/config')
        .send(validConfig);
      
      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('activity_id');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body.title).toBe(validConfig.title);
      expect(response.body.grade).toBe(validConfig.grade);
    });

    it('should return 400 when title is missing', async () => {
      const invalidConfig = {
        grade: 12,
        modules: ['Forças'],
        number_of_exercises: 3,
        total_time_minutes: 90,
        exercises: [{ question: 'Test', options: ['A', 'B'] }]
      };

      const response = await request(app)
        .post('/api/v1/config')
        .send(invalidConfig);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toContain('O título da atividade é obrigatório');
    });

    it('should return 400 when grade is invalid', async () => {
      const invalidConfig = {
        title: 'Test',
        grade: 9,
        modules: ['Forças'],
        number_of_exercises: 3,
        total_time_minutes: 90,
        exercises: [{ question: 'Test', options: ['A', 'B'] }]
      };

      const response = await request(app)
        .post('/api/v1/config')
        .send(invalidConfig);
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('O ano escolar deve ser 10, 11 ou 12');
    });

    it('should return 400 when exercises array is empty', async () => {
      const invalidConfig = {
        title: 'Test',
        grade: 12,
        modules: ['Forças'],
        number_of_exercises: 3,
        total_time_minutes: 90,
        exercises: []
      };

      const response = await request(app)
        .post('/api/v1/config')
        .send(invalidConfig);
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Deve adicionar pelo menos um exercício à atividade');
    });
  });

  describe('POST /api/v1/deploy', () => {
    it('should return 201 and application/json content-type', async () => {
      const response = await request(app)
        .post('/api/v1/deploy')
        .send({ activity_template_id: 'template-mrnewton-v1' });
      
      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('instance_id');
      expect(response.body).toHaveProperty('deploy_url');
      expect(response.body).toHaveProperty('expires_in_seconds');
    });
  });

  describe('GET /health', () => {
    it('should return 200 and healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body.status).toBe('ok');
    });
  });
});
