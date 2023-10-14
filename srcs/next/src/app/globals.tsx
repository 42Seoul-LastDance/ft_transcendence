export var BACK_URL = process.env.NEXT_PUBLIC_BACK_URL;
export var FT_CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
export var FRONT_URL = process.env.NEXT_PUBLIC_FRONT_URL;

export const getTime = (): string => {
  const koreanTimezone = 'Asia/Seoul';
  const now = new Date().toLocaleString('en-US', { timeZone: koreanTimezone });
  const [datePart, timePart] = now.split(' '); // 날짜와 시간 부분을 분리
  const [hour, minute] = timePart.split(':'); // 시간과 분을 분리
  const amOrPm = parseInt(hour, 10) < 12 ? '오전' : '오후'; // 오전 또는 오후 결정
  const parsedHour: number = parseInt(hour, 10) % 12 || 12; // 12시간 형식으로 변환
  return `${amOrPm} ${parsedHour}:${minute}`;
};

// user input 검증 길이
export const maxUniqueNameLength = 20;
export const maxPasswordLength = 20;
export const maxNameLength = 20;
export const maxTypeLength = 50;
