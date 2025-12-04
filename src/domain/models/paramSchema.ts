/**
 * ConfigParamsSchema - Configuration parameter schema model
 */
export interface ConfigParamDefinition {
  name: string;
  type: string;
  description?: string;
  items?: string;
  enum?: string[];
}

export class ConfigParamsSchema {
  public readonly id: string;
  public readonly params: ConfigParamDefinition[];
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(
    id: string,
    params: ConfigParamDefinition[],
    createdAt: string,
    updatedAt: string
  ) {
    this.id = id;
    this.params = params;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    Object.freeze(this);
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      params: this.params,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
