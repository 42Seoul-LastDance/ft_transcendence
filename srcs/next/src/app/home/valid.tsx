import { Dispatch } from 'react';
import { setAlertMsg, setShowAlert } from '../redux/alertSlice';
import { Action } from 'redux';

export const isValid = (
  comment: string,
  input: string,
  length: number,
  dispatch: Dispatch<Action>,
): boolean => {
  const isEmptyInput = (): boolean => {
    if (!input?.trim()) {
      const alertMessage = `${comment} 비었습니다.`;
      dispatch(setAlertMsg(alertMessage));
      dispatch(setShowAlert(true));
      return true;
    }
    return false;
  };

  const isOverInput = (): boolean => {
    if (input.length > length) {
      const alertMessage = `${comment} 너무 깁니다. : ${length}자 제한`;
      dispatch(setAlertMsg(alertMessage));
      dispatch(setShowAlert(true));
      return true;
    }
    return false;
  };

  const isRegexInput = (): boolean => {
    const invalidCharacters = /['"\/\*\+=<>]/g;
    if (invalidCharacters.test(input)) {
      const alertMessage = `${comment} 유효하지 않습니다. 특수문자 제한: ${input}`;
      dispatch(setAlertMsg(alertMessage));
      dispatch(setShowAlert(true));
      return true;
    }
    return false;
  };

  if (isOverInput() || isEmptyInput() || isRegexInput()) return false;
  else return true;
};
