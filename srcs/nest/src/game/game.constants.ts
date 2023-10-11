//* user table: exp, level
export const POINT: number = 100;
export const LEVELUP: number = 500;

//scorePoint()
export const MAXSCORE: number = 5;

//TimeZone
export const TIMEZONE: string = 'Asia/Seoul';

//equals()
export const EPSILON = 0.1;

//Game: Ball
export const BALL_PADDING: number = 2;
export const SCORE_PADDING: number = 0.5;
export const BALL_SPEED: [number, number] = [1000, 1500]; //[NORMAL, HARD]
export const BALL_POS_X_MIN: number = -19.3;
export const BALL_POS_X_MAX: number = 19.3;
export const BALL_POS_Y: number = 0.8;
export const BALL_POS_Z_MIN: number = -14.3;
export const BALL_POS_Z_MAX: number = 14.3;
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
export const PADDLE_POS_Z_MIN: number = -13 - 1; // 움직임 범위
export const PADDLE_POS_Z_MAX: number = 13 + 1; // + PADDING; //움직임 범위
export const PADDLE_ROTATE_X: number = 0;
export const PADDLE_ROTATE_Y: number = 0;
export const PADDLE_ROTATE_Z: number = 0;
