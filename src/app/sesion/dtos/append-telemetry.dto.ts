// src/app/session/dtos/append-telemetry.dto.ts
import { IsNumber } from 'class-validator';

export class SessionDataDto {
  @IsNumber()
  measuredCurrent_mA: number;

  @IsNumber()
  temperature_C: number;
}
