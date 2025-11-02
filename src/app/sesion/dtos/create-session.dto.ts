// src/app/session/dtos/create-session.dto.ts
import { IsInt, IsOptional, IsString, IsUUID, IsNumber } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  patientId: string;

  @IsString()
  deviceSerial: string;

  @IsInt()
  durationSeconds: number; // 60 | 300 | 600

  @IsNumber()
  targetCurrent_mA: number; // mA objetivo
}
