import { Injectable } from '@nestjs/common';
import { DirectMessageRepository } from './directMessage.repository';

@Injectable()
export class DirectMessageService {
    constructor(private directMessageRepository: DirectMessageRepository) {}

}