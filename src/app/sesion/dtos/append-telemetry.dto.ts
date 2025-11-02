// src/app/session/dtos/append-telemetry.dto.ts
import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class TelemetryRowDto {
  @IsNumber()
  measuredCurrent_mA: number;

  @IsNumber()
  temperature_C: number;
}

export class AppendTelemetryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelemetryRowDto)
  data: TelemetryRowDto[];
}
