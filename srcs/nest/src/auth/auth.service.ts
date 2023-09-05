import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository, // private jwtService: JwtService,
  ) {}

  //! 이 아래로는 무시하세요
  //로그인 시 받을 정보? -> Auth

}
