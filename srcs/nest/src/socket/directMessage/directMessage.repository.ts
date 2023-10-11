import { Repository } from 'typeorm/repository/Repository';
import { DirectMessage } from './directMessage.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DirectMessageRepository extends Repository<DirectMessage> {}
