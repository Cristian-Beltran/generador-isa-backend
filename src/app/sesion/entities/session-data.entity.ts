// src/app/session/entities/session-data.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Session } from './session.entity';

@Entity('session_data')
@Index('idx_session_data_recorded_at', ['recordedAt'])
export class SessionData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Session, (s) => s.records, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  session: Session;

  /** Corriente real medida (mA) */
  @Column('float')
  measuredCurrent_mA: number;

  /** Temperatura medida (°C) */
  @Column('float')
  temperature_C: number;

  /** Timestamp del muestreo (se graba cada segundo que dura la sesión) */
  @CreateDateColumn()
  recordedAt: Date;
}
