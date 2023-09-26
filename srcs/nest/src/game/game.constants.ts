//getBallStartDir()
export const MIN: number = 0;
export const MAX: number = 2;
export const MINF: number = 0.2;
export const MAXF: number = 0.7;

//scorePoint()
export const MAXSCORE: number = 5;

//TimeZone
export const TIMEZONE: string = 'Asia/Seoul';

//Game: Ball
//TODO score 지점 확인때문에 패딩 빼둠
// const PADDING: number = 1;
//TODO hard mode ball speed
export const BALL_SPEED: [number, number] = [15, 15]; //[NORMAL, HARD]
export const BALL_POS_Y: number = 0.8;
export const BALL_POS_X_MIN: number = -19.3; // - PADDING;
export const BALL_POS_X_MAX: number = 19.3; // + PADDING;
export const BALL_POS_Z_MIN: number = -14.3; // - PADDING;
export const BALL_POS_Z_MAX: number = 14.3; // + PADDING;
export const BALL_SCALE_X: number = 0.5;
export const BALL_SCALE_Y: number = 0.5;
export const BALL_SCALE_Z: number = 0.5;

//Game: Paddle_common
export const PADDLE_SPEED: number = 1000;
export const PADDLE_SCALE_X: number = 0.3;
export const PADDLE_SCALE_Y: number = 0.7;
export const PADDLE_SCALE_Z: number = 3;
export const PADDLE_POS_X: [number, number] = [-18.5, 18.5];
export const PADDLE_POS_Y: number = 0.85;
export const PADDLE_POS_Z_MIN: number = -13; // - PADDING; //움직임 범위
export const PADDLE_POS_Z_MAX: number = 13; // + PADDING; //움직임 범위
export const PADDLE_ROTATE_X: number = 0;
export const PADDLE_ROTATE_Y: number = 0;
export const PADDLE_ROTATE_Z: number = 0;
