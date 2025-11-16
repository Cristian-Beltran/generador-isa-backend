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
import { SessionDataDto } from '../dtos/append-telemetry.dto';

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
    const device = await this.deviceRepo.findOne({
      where: { serialNumber: dto.deviceSerial },
      relations: ['patient'],
    });
    if (!device) throw new NotFoundException('Device no encontrado');

    const session = this.sessionRepo.create({
      device,
      patient: device.patient,
      durationSeconds: dto.durationSeconds,
      targetCurrent_mA: dto.targetCurrent_mA,
    });
    const saved = await this.sessionRepo.save(session);

    return {
      id: saved.id,
      patientId: device.patient.id,
      deviceId: device.id,
      deviceSerial: dto.deviceSerial,
      startedAt: saved.startedAt,
      endedAt: saved.endedAt ?? null,
      durationSeconds: saved.durationSeconds,
      targetCurrent_mA: saved.targetCurrent_mA,
    };
  }

  // POST /sessions/:id/data
  async appendData(sessionId: string, dto: SessionDataDto) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['patient', 'device'],
    });
    if (!session) throw new NotFoundException('Session no encontrada');

    const data = this.dataRepo.create({
      session,
      measuredCurrent_mA: dto.measuredCurrent_mA,
      temperature_C: dto.temperature_C,
    });
    await this.dataRepo.save(data);
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
      relations: ['device', 'records'],
    });
    if (!session) throw new NotFoundException('Session no encontrada');
    return session;
  }

  // GET /sessions?patientId=...
  async list({ patientId }: { patientId?: string }) {
    if (patientId) {
      return this.sessionRepo.find({
        where: { patient: { user: { id: patientId } } },
        order: { startedAt: 'DESC' },
        relations: ['device', 'records'],
      });
    }
    return this.sessionRepo.find({
      order: { startedAt: 'DESC' },
      relations: ['patient', 'device'],
    });
  }
}
