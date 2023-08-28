import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  profileurl: string;

  constructor(partial: Partial<Users>) {
    Object.assign(this, partial);
  }
}
