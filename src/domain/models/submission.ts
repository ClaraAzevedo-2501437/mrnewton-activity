/**
 * Answer - Individual answer for a question
 */
export interface Answer {
  selectedOption: string;  // A/B/C/D/...
  rationale: string;        // Free text explanation
}

/**
 * AttemptResult - Result of a single attempt
 */
export interface AttemptResult {
  attemptIndex: number;
  answers: Record<string, Answer>;  // questionId -> Answer
  result: number;  // Percentage of correct answers (0-100)
  submittedAt: string;  // Timestamp for this attempt
}

/**
 * Submission - Student submission with multiple attempts
 */
export class Submission {
  public readonly submissionId: string;
  public readonly instanceId: string;
  public readonly studentId: string;
  public readonly numberOfAttempts: number;
  public readonly attempts: AttemptResult[];
  public readonly createdAt: string;

  constructor(
    submissionId: string,
    instanceId: string,
    studentId: string,
    numberOfAttempts: number,
    attempts: AttemptResult[],
    createdAt: string
  ) {
    this.submissionId = submissionId;
    this.instanceId = instanceId;
    this.studentId = studentId;
    this.numberOfAttempts = numberOfAttempts;
    this.attempts = [...attempts];
    this.createdAt = createdAt;
    Object.freeze(this);
  }

  public toJSON(): Record<string, any> {
    return {
      submissionId: this.submissionId,
      instanceId: this.instanceId,
      studentId: this.studentId,
      numberOfAttempts: this.numberOfAttempts,
      attempts: this.attempts,
      createdAt: this.createdAt
    };
  }
}
