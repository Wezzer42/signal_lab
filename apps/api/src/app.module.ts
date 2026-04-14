import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScenarioModule } from './scenario/scenario.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [PrismaModule, MetricsModule, ScenarioModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
