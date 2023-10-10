import axios from 'axios';
import { getCookie } from './Cookie';
import reGenerateToken from './auth';
import { useRouter } from 'next/navigation';
import { BACK_URL } from './globals';
import { AxiosResponse } from 'axios';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: `${BACK_URL}`, // API의 기본 URL을 여기에 설정하세요.
  timeout: 10000, // 요청 제한 시간(ms)을 설정하세요.
});

const sendRequest = async (
  method: string,
  url: string,
  router: any,
  data = {},
): Promise<AxiosResponse> => {
  try {
    let token = getCookie('access_token'); // 여기에 쿠키 이름을 설정하세요.
    if (!token) {
      router.push('/');
      return new Promise(() => {});
    }
    // 요청 헤더에 토큰 추가
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Axios 요청 보내기
    console.log('첫 번째 요청');
    const response = await axiosInstance({
      method,
      url,
      data,
    });

    console.log('첫 번째 요청 성공! Response : ', response);
    return response;
  } catch (error: any) {
    console.log('첫 번째 요청 실패!');
    console.log('두 번째 요청');
    switch (error.response?.status) {
      case 404:
        router.push('/');
        break;
      case 401:
        await reGenerateToken(router);
        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${getCookie('access_token')}`;
        try {
          const response = await axiosInstance({
            method,
            url,
            data,
          });
          console.log('토큰 재발급 성공! Response : ', response);
          return response;
        } catch (error) {
          console.log('두 번째 요청 실패! <-- 말이 안 됨 ㄹㅇ');
          router.push('/');
        }
    }
    return new Promise(() => {});
  }
};

export default sendRequest;
