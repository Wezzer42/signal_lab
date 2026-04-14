import { Injectable } from '@nestjs/common';
import { Prisma, ScenarioRun } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RunScenarioDto, ScenarioType } from './dto/run-scenario.dto';
import { MetricsService } from '../metrics/metrics.service';
import pino from 'pino';
import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/node';

const SCENARIO_MESSAGES: Record<ScenarioType, string> = {
  [ScenarioType.HEALTHY]: 'Healthy request completed successfully',
  [ScenarioType.SLOW]: 'Slow request completed successfully',
  [ScenarioType.SYSTEM_ERROR]: 'System error triggered'
};

@Injectable()
export class ScenarioService {
  private readonly logger = pino({
    name: ScenarioService.name,
    level: process.env.LOG_LEVEL ?? 'info'
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService
  ) {}

  async runScenario({ scenario }: RunScenarioDto): Promise<ScenarioRun> {
    const startedAt = Date.now();
    const requestId = randomUUID();
    let status: Prisma.ScenarioRunCreateInput['status'] = 'success';
    let message = SCENARIO_MESSAGES[scenario];
    let run: ScenarioRun;

    try {
      switch (scenario) {
        case ScenarioType.HEALTHY:
          // nothing extra to do
          break;
        case ScenarioType.SLOW:
          await this.simulateSlowRequest();
          break;
        case ScenarioType.SYSTEM_ERROR:
          throw new Error('Intentional system error');
        default:
          throw new Error(`Unsupported scenario: ${scenario}`);
      }
      run = await this.persistRun(scenario, status, startedAt, message);
      this.metrics.recordScenario({
        scenario,
        status,
        durationMs: run.durationMs ?? 0
      });
      this.logger.info(this.formatLogPayload('success', scenario, run, requestId));
      return run;
    } catch (error) {
      status = 'error';
      message = error instanceof Error ? error.message : 'Scenario failed';
      run = await this.persistRun(scenario, status, startedAt, message);
      this.metrics.recordScenario({
        scenario,
        status,
        durationMs: run.durationMs ?? 0
      });
      this.logger.error(this.formatLogPayload('error', scenario, run, requestId, error));
      this.reportScenarioError(run, error, requestId);
      return run;
    }
  }

  async listRuns(): Promise<ScenarioRun[]> {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  private async persistRun(
    scenario: ScenarioType,
    status: string,
    startedAt: number,
    message: string
  ): Promise<ScenarioRun> {
    const durationMs = Math.max(0, Date.now() - startedAt);
    return this.prisma.scenarioRun.create({
      data: {
        scenario,
        status,
        durationMs,
        message
      }
    });
  }

  private async simulateSlowRequest(): Promise<void> {
    const delay = 2000 + Math.floor(Math.random() * 2000); // 2-4 seconds
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private formatLogPayload(
    level: 'success' | 'error',
    scenario: ScenarioType,
    run: ScenarioRun,
    requestId: string,
    error?: unknown
  ) {
    return {
      scenario,
      status: level,
      durationMs: run.durationMs ?? 0,
      runId: run.id,
      message: run.message ?? '',
      requestId,
      error: error instanceof Error ? error.message : undefined
    };
  }

  private reportScenarioError(run: ScenarioRun, error: unknown, requestId: string) {
    const sentryClient = Sentry.getCurrentHub().getClient();
    if (!sentryClient) {
      return;
    }
    Sentry.captureException(error, {
      tags: {
        scenario: run.scenario,
        status: run.status
      },
      extra: {
        runId: run.id,
        durationMs: run.durationMs,
        message: run.message,
        requestId
      }
    });
  }
}
