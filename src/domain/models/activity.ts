/**
 * ActivityConfig - Configuration for the entire test/quiz
 * All parameters apply to the whole activity, not per-exercise
 */
export interface ActivityConfig {
  title: string;
  grade: number; // 10, 11, or 12
  modules: string; // text/plain - single string, not array
  number_of_exercises: number;
  total_time_minutes: number;
  number_of_retries: number;
  relative_tolerance_pct?: number;
  absolute_tolerance?: number;
  show_answers_after_submission?: boolean;
  scoring_policy?: string; // text/plain - 'linear' or 'non-linear'
  approval_threshold?: number;
  exercises: Exercise[];
}

export interface Exercise {
  question: string; // Required
  options: string[]; // Required - array of text/plain
  correct_options: string; // Required - text/plain
  correct_answer: string; // Required - text/plain
}

/**
 * Activity (Definition) - Immutable model created ONLY via the Builder
 */
export class Activity {
  public readonly id: string;
  public readonly cfg: ActivityConfig;
  public readonly createdAt: string;

  constructor(id: string, cfg: ActivityConfig, createdAt: string) {
    this.id = id;
    this.cfg = Object.freeze({ ...cfg }); // Deep immutability
    this.createdAt = createdAt;
    Object.freeze(this); // Make the entire object immutable
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      cfg: this.cfg,
      createdAt: this.createdAt
    };
  }
}
