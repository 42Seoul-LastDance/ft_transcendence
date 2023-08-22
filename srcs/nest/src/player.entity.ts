import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('player')
export class Player {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column('int')
  point: number;
}
