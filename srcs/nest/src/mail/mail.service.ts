import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    // async verifyFactorAuthentication(): Promise<bool> {

    //     return true;
    // }

    async sendMail() {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER_ID,
                pass: process.env.GMAIL_USER_PASSWORD,
            },
        });

        const generate2FACode = () => {
            return Math.floor(100000 + Math.random() * 900000).toString();
        };

        const code = generate2FACode();
        const mailOptions = {
            to: 'juhoh@student.42seoul.kr',
            subject: '🏓[Pongmates]🏓 2FA Verification Code',
            text: '외않되',
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>감사 메시지</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center;">
                <table align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" width="400" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin: 20px auto;">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <!-- 하트 아이콘 -->
                            <i class="fas fa-heart" style="color: red; font-size: 24px;"></i>
                            <!-- 감사 메시지 -->
                            <p style="font-size: 18px; margin: 10px 0;">Pongmates를 사용해주셔서 감사합니다!</p>
                            <!-- 인증코드 변수 삽입 -->
                            <p style="font-size: 24px; font-weight: bold; color: #007bff;">당신의 인증코드는 YourAuthCode123 입니다.</p>
                        </td>
                    </tr>
                </table>
                <!-- Font Awesome 아이콘 CDN -->
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            </body>
            </html>`,
        };
        console.log(`mail sent! code is ${code}`);
        await transporter.sendMail(mailOptions);
        //

        //
    }
}
