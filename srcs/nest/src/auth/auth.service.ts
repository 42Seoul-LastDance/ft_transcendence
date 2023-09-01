import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { AuthDto } from './dto/auth42.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository, // private jwtService: JwtService,
    ) {}
    
    async signUp(
        authCredentialDto: AuthCredentialDto,
    ){
     //회원가입하고 저장됨. -> auth42Dto   
    }

    async signIn(
        auth42Dto : Auth42Dto,
        ): Promise<{accessToken string}> {
            //
        }

    //! 이 아래로는 무시하세요
    //로그인 시 받을 정보? -> Auth

    // get42Login(): string {
    //     //로그인 링크 생성:  client_id, redirect_uri = 우리의 redirect 시킬 uri.
    //     //보통은 Key로 숨겨두는 것 같다.
    //     return 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-f0f8d4e13810d147a7fb0848c16cc1cbbebbbf9c6d353427710512de67a85cad&redirect_uri=https%3A%2F%2Fprofile.intra.42.fr%2Foauth%2Fapplications&response_type=code';
    // }

    // //http://www.example.com/oauth_callback?code=ABC1234
    // async verification(code: string): Promise<AuthDto> {
    //     //1. code 를 이용해서 accesstoken 추출
    //     var authDto = this.getAccessTokenByCode(code);
    //     // const accessToken = this.getAccessTokenByCode(code);
    //     // const authDto = await this.getUserInfoByAccessToken(accessToken);

    //     //2.access 토큰을 이용해서 유저 정보 추출
    //     // "https://api.intra.42.fr/v2/me" -> 42apiRequest.txt 참조!

    //     if (!authDto) {
    //         throw new UnauthorizedException();
    //     }

    //     return authDto;
    // }

    // async getAccessTokenByCode(code: string) {
    //     // AuthDto
    //     // 1-1.HttpHeader 생성 및 정보 추가
    //     // 1-2.Request에 담을 정보 추가
    //     // 1-3.request를 하기위해 HttpEntity 객체에 헤더와 정보 조립
    //     // 1-4.code에 대한 인증요청을 할 url :
    // }

    // async getUserInfoByAccessToken(authDto: AuthDto): AuthDto {
    //     // 2.access 토큰을 이용해서 유저 정보 추출
    //     // email, login, image_url, displayname 가져와서 Dto로 반환
    // }
}
