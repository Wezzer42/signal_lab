import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import {
  SIGNAL_LAB_DURATION_MS,
  SIGNAL_LAB_ERRORS_TOTAL,
  SIGNAL_LAB_SCENARIOS_TOTAL
} from './metrics.constants';

export interface ScenarioMetricPayload {
  scenario: string;
  status: string;
  durationMs: number;
}

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric(SIGNAL_LAB_SCENARIOS_TOTAL) private readonly scenarioCounter: Counter<string>,
    @InjectMetric(SIGNAL_LAB_ERRORS_TOTAL) private readonly errorCounter: Counter<string>,
    @InjectMetric(SIGNAL_LAB_DURATION_MS) private readonly durationHistogram: Histogram<string>
  ) {}

  recordScenario(payload: ScenarioMetricPayload) {
    const { scenario, status, durationMs } = payload;
    this.scenarioCounter.inc({ scenario, status });
    this.durationHistogram.observe({ scenario }, durationMs);
    if (status === 'error') {
      this.errorCounter.inc({ scenario });
    }
  }
}
