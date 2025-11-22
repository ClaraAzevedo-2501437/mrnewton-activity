import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/v1/config/params
router.get('/params', (req: Request, res: Response) => {
  const params = {
    params: [
      { name: 'title', type: 'string', description: 'Título da atividade' },
      { name: 'grade', type: 'integer', description: 'Ano (10,11,12)' },
      { name: 'modules', type: 'array', items: 'string', description: 'Módulos temáticos' },
      { name: 'number_of_exercises', type: 'integer' },
      { name: 'total_time_minutes', type: 'integer' },
      { name: 'number_of_retries', type: 'integer' },
      { name: 'relative_tolerance_pct', type: 'number' },
      { name: 'absolute_tolerance', type: 'number' },
      { name: 'show_answers_after_submission', type: 'boolean' },
      { name: 'scoring_policy', type: 'string', enum: ['linear', 'non-linear'] },
      { name: 'approval_threshold', type: 'number' },
      {
        name: 'exercises',
        type: 'array',
        items: 'object',
        description: 'Lista de exercícios (question, options, correct_options, correct_answer)'
      }
    ]
  };

  res.status(200).json(params);
});

// POST /api/v1/config
router.post('/', (req: Request, res: Response) => {
  const config = req.body;

  // Validações obrigatórias
  const errors: string[] = [];

  // Validar title
  if (!config.title || typeof config.title !== 'string' || config.title.trim().length === 0) {
    errors.push('O título da atividade é obrigatório');
  }

  // Validar grade
  if (!config.grade || typeof config.grade !== 'number') {
    errors.push('O ano escolar é obrigatório');
  } else if (![10, 11, 12].includes(config.grade)) {
    errors.push('O ano escolar deve ser 10, 11 ou 12');
  }

  // Validar modules
  if (!config.modules || !Array.isArray(config.modules)) {
    errors.push('Deve selecionar pelo menos um módulo temático');
  } else if (config.modules.length === 0) {
    errors.push('Deve selecionar pelo menos um módulo temático');
  } else if (!config.modules.every((m: any) => typeof m === 'string')) {
    errors.push('Os módulos selecionados são inválidos');
  }

  // Validar number_of_exercises
  if (!config.number_of_exercises || typeof config.number_of_exercises !== 'number') {
    errors.push('O número de exercícios é obrigatório');
  } else if (config.number_of_exercises <= 0) {
    errors.push('O número de exercícios deve ser superior a 0');
  }

  // Validar total_time_minutes
  if (!config.total_time_minutes || typeof config.total_time_minutes !== 'number') {
    errors.push('O tempo total da atividade é obrigatório');
  } else if (config.total_time_minutes <= 0) {
    errors.push('O tempo total da atividade deve ser superior a 0 minutos');
  }

  // Validar number_of_retries
  if (config.number_of_retries !== undefined && typeof config.number_of_retries !== 'number') {
    errors.push('O número de tentativas deve ser um valor numérico');
  } else if (config.number_of_retries !== undefined && config.number_of_retries < 0) {
    errors.push('O número de tentativas não pode ser negativo');
  }

  // Validar scoring_policy
  if (config.scoring_policy && !['linear', 'non-linear'].includes(config.scoring_policy)) {
    errors.push('A política de pontuação deve ser "linear" ou "non-linear"');
  }

  // Validar approval_threshold
  if (config.approval_threshold !== undefined) {
    if (typeof config.approval_threshold !== 'number') {
      errors.push('O limiar de aprovação deve ser um valor numérico');
    } else if (config.approval_threshold < 0 || config.approval_threshold > 1) {
      errors.push('O limiar de aprovação deve estar entre 0 e 1 (exemplo: 0.5 para 50%)');
    }
  }

  // Validar show_answers_after_submission
  if (config.show_answers_after_submission !== undefined && typeof config.show_answers_after_submission !== 'boolean') {
    errors.push('A opção de mostrar respostas após submissão é inválida');
  }

  // Validar exercises
  if (!config.exercises || !Array.isArray(config.exercises)) {
    errors.push('Deve adicionar pelo menos um exercício à atividade');
  } else if (config.exercises.length === 0) {
    errors.push('Deve adicionar pelo menos um exercício à atividade');
  } else {
    config.exercises.forEach((exercise: any, index: number) => {
      if (!exercise.question || typeof exercise.question !== 'string') {
        errors.push(`O exercício ${index + 1} deve ter uma pergunta`);
      }
      if (!exercise.options || !Array.isArray(exercise.options)) {
        errors.push(`O exercício ${index + 1} deve ter opções de resposta`);
      }
    });
  }

  // Se houver erros, retornar 400
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Erro na validação dos dados',
      details: errors
    });
  }

  // Se passar nas validações, retornar a configuração com um ID gerado
  const response = {
    ...config,
    activity_id: `activity_${Math.random().toString(36).substring(2, 11)}`,
    created_at: new Date().toISOString()
  };

  res.status(201).json(response);
});

export default router;
