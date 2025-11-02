// src/app/session/entities/session.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from '../../users/entities/patient.entity';
import { Device } from '../../device/entities/device.entity';
import { SessionData } from './session-data.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { eager: true, nullable: false })
  patient: Patient;

  @ManyToOne(() => Device, { eager: true, nullable: false })
  device: Device;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  /** Duración planificada de la sesión en segundos (1, 5 o 10 min => 60, 300, 600) */
  @Column({ type: 'int' })
  durationSeconds: number;

  /** Corriente objetivo en mA (float, simple) */
  @Column('float')
  targetCurrent_mA: number;

  @OneToMany(() => SessionData, (d) => d.session, { cascade: true })
  records: SessionData[];
}
