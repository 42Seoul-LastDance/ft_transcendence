import { Auth42Dto } from './dto/auth42.dto';
import { AuthService } from './auth.service';
import { Get, Injectable, Res } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import axios from 'axios';
import { Response } from 'express';
// import { UserInfoDto } from 'src/user/dto/user-info.dto';
// import { userRole } from 'src/user/user-role.enum';

//42 OAuth2 인증을 위한 클래스
/*
1. 사용자가 인증을 위해 42서비스로 리다이렉트 된다. 42 서비스에서 로그인 하고 권한을 부여받게 된다.
2. 사용자가 권한을 부여하면 42 서비스는 엑세스코드를 생성하고, 이 코드를 callback url로 전송한다.
3. PassportStrategy 클래스는 전달받은 엑세코드를 사용하여 엑세스 토큰을 요청하고, 42 서비스로부터 엑세스 토큰을 받아온다.
4. validate 메서드가 호출되고, 이떄 전달된 엑세스 토큰과 리프레시 토큰을 사용해서 인증 검증 로직을 수행한다.
5. validate 메서드에서는 인증 검증 후에 엑세스 토큰을 반환한다.
*/
// interface UserInfo {
//     id: number;
//     login: string;
//     email: string;
//     image: {};
//     // 필요한 다른 필드들도 추가
// }

@Injectable()
export class FortytwoStrategy extends PassportStrategy(Strategy, 'fortytwo') {
    //PassportStrategy 의 전략을 초기화하고 설정.
    constructor(private authService: AuthService) {
        super({
            authorizationURL: `https://api.intra.42.fr/oauth/authorize`,
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            clientID: process.env.FT_CLIENT_ID,
            clientSecret: process.env.FT_CLIENT_SECRET,
            callbackURL: process.env.FT_CALLBACK,
        });
    }

    //인증이 성공한 후 호출된다.
    async validate(accessToken: string, refreshToken: string, @Res() res: Response) {
        console.log('42 valdation 함수 호출');

        try {
            const response = await axios.get('https://api.intra.42.fr/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const userData = response.data;
            //* TODO: 필드를 못가져오는 경우에 대한 예외처리
            const desiredFields: Auth42Dto = {
                email: userData.email,
                slackId: userData.login,
                image_url: userData.image.link,
                displayname: userData.displayname,
                accesstoken: accessToken,
            };
            return desiredFields;
        } catch (error) {
            // redirect to front login page
            console.log('front main?');
            // return res.redirect(process.env.FRONT_ADDR);
        }
    }
}
