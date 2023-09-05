import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { Auth42Dto } from './dto/auth42.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository, private auth42Dto: Auth42Dto// private jwtService: JwtService,
  ) {}

  setLoginUser(auth42Dto: Auth42Dto) {
    this.auth42Dto = auth42Dto;
  }

  getUserData() {
    return this.auth42Dto;
  }

  //! 이 아래로는 무시하세요
  //로그인 시 받을 정보? -> Auth

}
