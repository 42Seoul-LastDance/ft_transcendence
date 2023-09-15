import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RegenerateJwtGuard extends AuthGuard('regenerate-jwt') {}
