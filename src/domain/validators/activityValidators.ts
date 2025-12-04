import { ActivityConfig, Exercise } from '../models/activity';

/**
 * ValidationResult - Contains validation status and all errors
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * ActivityValidators - Comprehensive validation logic for ActivityConfig
 */
export class ActivityValidators {
  /**
   * Validate complete ActivityConfig
   */
  public static validateActivityConfig(config: Partial<ActivityConfig>): ValidationResult {
    const errors: Record<string, string[]> = {};

    // Validate title
    if (!config.title || typeof config.title !== 'string' || config.title.trim().length === 0) {
      errors.title = ['O título da atividade é obrigatório'];
    } else if (config.title.length > 200) {
      errors.title = errors.title || [];
      errors.title.push('O título não pode exceder 200 caracteres');
    }

    // Validate grade
    if (!config.grade || typeof config.grade !== 'number') {
      errors.grade = ['O ano escolar é obrigatório'];
    } else if (![10, 11, 12].includes(config.grade)) {
      errors.grade = ['O ano escolar deve ser 10, 11 ou 12'];
    }

    // Validate modules (text/plain - single string)
    if (!config.modules || typeof config.modules !== 'string' || config.modules.trim().length === 0) {
      errors.modules = ['Deve selecionar pelo menos um módulo temático'];
    }

    // Validate number_of_exercises
    if (!config.number_of_exercises || typeof config.number_of_exercises !== 'number') {
      errors.number_of_exercises = ['O número de exercícios é obrigatório'];
    } else if (config.number_of_exercises <= 0) {
      errors.number_of_exercises = ['O número de exercícios deve ser superior a 0'];
    } else if (!Number.isInteger(config.number_of_exercises)) {
      errors.number_of_exercises = ['O número de exercícios deve ser um número inteiro'];
    }

    // Validate total_time_minutes
    if (!config.total_time_minutes || typeof config.total_time_minutes !== 'number') {
      errors.total_time_minutes = ['O tempo total da atividade é obrigatório'];
    } else if (config.total_time_minutes <= 0) {
      errors.total_time_minutes = ['O tempo total da atividade deve ser superior a 0 minutos'];
    } else if (!Number.isInteger(config.total_time_minutes)) {
      errors.total_time_minutes = ['O tempo total deve ser um número inteiro de minutos'];
    }

    // Validate number_of_retries
    if (config.number_of_retries === undefined || config.number_of_retries === null) {
      errors.number_of_retries = ['O número de tentativas é obrigatório'];
    } else if (typeof config.number_of_retries !== 'number') {
      errors.number_of_retries = ['O número de tentativas deve ser um valor numérico'];
    } else if (config.number_of_retries < 0) {
      errors.number_of_retries = ['O número de tentativas não pode ser negativo'];
    } else if (!Number.isInteger(config.number_of_retries)) {
      errors.number_of_retries = ['O número de tentativas deve ser um número inteiro'];
    }

    // Validate relative_tolerance_pct (optional)
    if (config.relative_tolerance_pct !== undefined && config.relative_tolerance_pct !== null) {
      if (typeof config.relative_tolerance_pct !== 'number') {
        errors.relative_tolerance_pct = ['A tolerância relativa deve ser um valor numérico'];
      } else if (config.relative_tolerance_pct < 0 || config.relative_tolerance_pct > 100) {
        errors.relative_tolerance_pct = ['A tolerância relativa deve estar entre 0 e 100'];
      }
    }

    // Validate absolute_tolerance (optional)
    if (config.absolute_tolerance !== undefined && config.absolute_tolerance !== null) {
      if (typeof config.absolute_tolerance !== 'number') {
        errors.absolute_tolerance = ['A tolerância absoluta deve ser um valor numérico'];
      } else if (config.absolute_tolerance < 0) {
        errors.absolute_tolerance = ['A tolerância absoluta não pode ser negativa'];
      }
    }

    // Validate show_answers_after_submission (optional)
    if (config.show_answers_after_submission !== undefined && typeof config.show_answers_after_submission !== 'boolean') {
      errors.show_answers_after_submission = ['A opção de mostrar respostas após submissão deve ser um valor booleano'];
    }

    // Validate scoring_policy (optional, text/plain)
    if (config.scoring_policy !== undefined) {
      if (typeof config.scoring_policy !== 'string' || config.scoring_policy.trim().length === 0) {
        errors.scoring_policy = ['A política de pontuação deve ser uma string válida'];
      } else if (!['linear', 'non-linear'].includes(config.scoring_policy)) {
        errors.scoring_policy = ['A política de pontuação deve ser "linear" ou "non-linear"'];
      }
    }

    // Validate approval_threshold (optional)
    if (config.approval_threshold !== undefined && config.approval_threshold !== null) {
      if (typeof config.approval_threshold !== 'number') {
        errors.approval_threshold = ['O limiar de aprovação deve ser um valor numérico'];
      } else if (config.approval_threshold < 0 || config.approval_threshold > 1) {
        errors.approval_threshold = ['O limiar de aprovação deve estar entre 0 e 1 (exemplo: 0.5 para 50%)'];
      }
    }

    // Validate exercises
    if (!config.exercises || !Array.isArray(config.exercises)) {
      errors.exercises = ['Deve adicionar pelo menos um exercício à atividade'];
    } else if (config.exercises.length === 0) {
      errors.exercises = ['Deve adicionar pelo menos um exercício à atividade'];
    } else {
      const exerciseErrors = this.validateExercises(config.exercises);
      if (exerciseErrors.length > 0) {
        errors.exercises = exerciseErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate array of exercises
   * All fields are required: question, options, correct_options, correct_answer
   */
  private static validateExercises(exercises: any[]): string[] {
    const errors: string[] = [];

    exercises.forEach((exercise: any, index: number) => {
      if (!exercise || typeof exercise !== 'object') {
        errors.push(`O exercício ${index + 1} é inválido`);
        return;
      }

      // Validate question (required, text/plain)
      if (!exercise.question || typeof exercise.question !== 'string' || exercise.question.trim().length === 0) {
        errors.push(`O exercício ${index + 1} deve ter uma pergunta`);
      }

      // Validate options (required, array of text/plain)
      if (!exercise.options) {
        errors.push(`O exercício ${index + 1} deve ter opções de resposta`);
      } else if (!Array.isArray(exercise.options)) {
        errors.push(`O exercício ${index + 1} deve ter opções de resposta válidas (array)`);
      } else if (exercise.options.length === 0) {
        errors.push(`O exercício ${index + 1} deve ter pelo menos uma opção de resposta`);
      } else if (!exercise.options.every((opt: any) => typeof opt === 'string')) {
        errors.push(`As opções do exercício ${index + 1} devem ser texto`);
      }

      // Validate correct_options (required, text/plain)
      if (!exercise.correct_options) {
        errors.push(`O exercício ${index + 1} deve ter correct_options definido`);
      } else if (typeof exercise.correct_options !== 'string' || exercise.correct_options.trim().length === 0) {
        errors.push(`O correct_options do exercício ${index + 1} deve ser uma string válida`);
      }

      // Validate correct_answer (required, text/plain)
      if (!exercise.correct_answer) {
        errors.push(`O exercício ${index + 1} deve ter correct_answer definido`);
      } else if (typeof exercise.correct_answer !== 'string' || exercise.correct_answer.trim().length === 0) {
        errors.push(`O correct_answer do exercício ${index + 1} deve ser uma string válida`);
      }
    });

    return errors;
  }
}
