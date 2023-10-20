import axios from 'axios';
import reGenerateToken from './auth';
import { BACK_URL } from './globals';
import { AxiosResponse } from 'axios';
import { getCookie } from './cookie';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: `${BACK_URL}`, // API의 기본 URL을 여기에 설정하세요.
  timeout: 10000, // 요청 제한 시간(ms)을 설정하세요.
});

const sendRequestImage = async (
  method: string,
  url: string,
  router: any,
  data = {},
): Promise<AxiosResponse> => {
  let token = getCookie('access_token');
  if (!token) {
    router.push('/');
    return new Promise(() => {});
  }
  try {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await axiosInstance({
      method,
      url,
      responseType: 'arraybuffer',
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
        ] = `Bearer ${token}`;
        let secondResponse;
        try {
          secondResponse = await axiosInstance({
            method,
            url,
            responseType: 'arraybuffer',
            data,
          });
          return secondResponse;
        } catch (error: any) {
          console.log('토큰 재발급 후 요청 실패');
          switch (error.response?.status) {
            case 404:
              router.push('/notFound');
              break;
            case 401:
              console.log('ERR : 말이 안 됨 (재발급된 토큰이 그새 만료됨)');
              router.push('/');
              break;
            case 500:
              console.log('Internal Server Err');
              router.push('/');
              break;
            default:
              break;
          }
        }
    }
    return new Promise(() => {});
  }
};

export default sendRequestImage;
