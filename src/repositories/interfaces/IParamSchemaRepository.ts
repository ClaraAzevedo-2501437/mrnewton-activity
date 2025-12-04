import { ConfigParamsSchema } from '../../domain/models/paramSchema';

/**
 * IConfigParamsSchemaRepository - Interface for ConfigParamsSchema persistence
 */
export interface IConfigParamsSchemaRepository {
  /**
   * Save or update parameter schema
   */
  save(schema: ConfigParamsSchema): Promise<ConfigParamsSchema>;

  /**
   * Get the current active parameter schema
   */
  getCurrent(): Promise<ConfigParamsSchema | null>;

  /**
   * Find schema by ID
   */
  findById(id: string): Promise<ConfigParamsSchema | null>;

  /**
   * Get all schemas (history)
   */
  findAll(): Promise<ConfigParamsSchema[]>;
}
