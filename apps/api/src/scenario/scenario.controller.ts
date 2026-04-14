import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ScenarioService } from './scenario.service';
import { RunScenarioDto } from './dto/run-scenario.dto';

@Controller('scenarios')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  runScenario(@Body() dto: RunScenarioDto) {
    return this.scenarioService.runScenario(dto);
  }

  @Get('runs')
  listRuns() {
    return this.scenarioService.listRuns();
  }
}
