import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider
} from '@willsoto/nestjs-prometheus';
import {
  SIGNAL_LAB_DURATION_MS,
  SIGNAL_LAB_ERRORS_TOTAL,
  SIGNAL_LAB_SCENARIOS_TOTAL
} from './metrics.constants';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true
      }
    })
  ],
  providers: [
    MetricsService,
    makeCounterProvider({
      name: SIGNAL_LAB_SCENARIOS_TOTAL,
      help: 'Total number of scenario executions',
      labelNames: ['scenario', 'status']
    }),
    makeCounterProvider({
      name: SIGNAL_LAB_ERRORS_TOTAL,
      help: 'Total number of failed scenarios',
      labelNames: ['scenario']
    }),
    makeHistogramProvider({
      name: SIGNAL_LAB_DURATION_MS,
      help: 'Latest scenario duration in milliseconds',
      labelNames: ['scenario'],
      buckets: [10, 50, 100, 250, 500, 1000, 2000, 4000, 8000]
    })
  ],
  exports: [MetricsService]
})
export class MetricsModule {}
