import axios from 'axios';
import { getCookie } from './cookie';
import reGenerateToken from './auth';
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
    const response = await axiosInstance({
      method,
      url,
      data,
    });

    return response;
  } catch (error: any) {
    switch (error.response?.status) {
      case 404:
        router.push('/notFound');
        break;
      case 401:
        await reGenerateToken(router);
        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${getCookie('access_token')}`;
        let secondResponse;
        try {
          secondResponse = await axiosInstance({
            method,
            url,
            data,
          });
          console.log('토큰 재발급 성공! Response : ', secondResponse);
          return secondResponse;
        } catch (error: any) {
          console.log('두 번째 요청 실패! (토큰 재발급)', secondResponse);
          switch (error.response?.status) {
            case 404:
              router.push('/notFound');
              break;
            case 401:
              console.log('ERR : 말이 안 됨', secondResponse);
              router.push('/');
              break;
            default:
              console.log('이건 무슨 에러?', secondResponse);
              router.push('/');
              break;
          }
        }
    }
    return new Promise(() => {});
  }
};

export default sendRequest;
