// src/app/session/services/session.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { SessionData } from '../entities/session-data.entity';
import { Device } from '../../device/entities/device.entity';
import { Patient } from '../../users/entities/patient.entity';
import { CreateSessionDto } from '../dtos/create-session.dto';
import { AppendTelemetryDto } from '../dtos/append-telemetry.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(SessionData)
    private readonly dataRepo: Repository<SessionData>,
    @InjectRepository(Device) private readonly deviceRepo: Repository<Device>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  // POST /sessions
  async createSession(dto: CreateSessionDto) {
    const [patient, device] = await Promise.all([
      this.patientRepo.findOne({ where: { id: dto.patientId } }),
      this.deviceRepo.findOne({ where: { serialNumber: dto.deviceSerial } }),
    ]);
    if (!patient) throw new NotFoundException('Patient no encontrado');
    if (!device) throw new NotFoundException('Device no encontrado');

    const session = this.sessionRepo.create({
      patient,
      device,
      durationSeconds: dto.durationSeconds,
      targetCurrent_mA: dto.targetCurrent_mA,
    });
    const saved = await this.sessionRepo.save(session);

    return {
      id: saved.id,
      patientId: patient.id,
      deviceId: device.id,
      deviceSerial: dto.deviceSerial,
      startedAt: saved.startedAt,
      endedAt: saved.endedAt ?? null,
      durationSeconds: saved.durationSeconds,
      targetCurrent_mA: saved.targetCurrent_mA,
    };
  }

  // POST /sessions/:id/data
  async appendData(sessionId: string, dto: AppendTelemetryDto) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['patient', 'device'],
    });
    if (!session) throw new NotFoundException('Session no encontrada');

    const rows = dto.data?.length ? dto.data : [];
    if (!rows.length) throw new BadRequestException('data vacío');

    const entities = rows.map((r) =>
      this.dataRepo.create({
        session,
        measuredCurrent_mA: r.measuredCurrent_mA,
        temperature_C: r.temperature_C,
      }),
    );
    await this.dataRepo.save(entities);

    return { sessionId, inserted: entities.length };
  }

  // POST /sessions/:id/close
  async closeSession(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session no encontrada');

    session.endedAt = new Date();
    await this.sessionRepo.save(session);
    return { id: session.id, endedAt: session.endedAt };
  }

  // GET /sessions/:id
  async findOne(id: string) {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['patient', 'device', 'records'],
    });
    if (!session) throw new NotFoundException('Session no encontrada');
    return session;
  }

  // GET /sessions?patientId=...
  async list({ patientId }: { patientId?: string }) {
    if (patientId) {
      return this.sessionRepo.find({
        where: { patient: { id: patientId } },
        order: { startedAt: 'DESC' },
        relations: ['patient', 'device'],
      });
    }
    return this.sessionRepo.find({
      order: { startedAt: 'DESC' },
      relations: ['patient', 'device'],
    });
  }
}
