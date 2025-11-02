// src/app/session/controllers/session.controller.ts
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SessionService } from '../services/session.service';
import { CreateSessionDto } from '../dtos/create-session.dto';
import { AppendTelemetryDto } from '../dtos/append-telemetry.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.service.createSession(dto);
  }

  @Post(':id/data')
  appendData(@Param('id') sessionId: string, @Body() dto: AppendTelemetryDto) {
    return this.service.appendData(sessionId, dto);
  }

  @Post(':id/close')
  close(@Param('id') sessionId: string) {
    return this.service.closeSession(sessionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get()
  list(@Query('patientId') patientId?: string) {
    return this.service.list({ patientId });
  }
}
