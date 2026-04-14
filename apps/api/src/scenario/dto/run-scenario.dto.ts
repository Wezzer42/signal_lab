import { IsEnum } from 'class-validator';

export enum ScenarioType {
  HEALTHY = 'healthy_request',
  SLOW = 'slow_request',
  SYSTEM_ERROR = 'system_error'
}

export class RunScenarioDto {
  @IsEnum(ScenarioType, { message: 'scenario must be one of healthy_request, slow_request, system_error' })
  scenario!: ScenarioType;
}
