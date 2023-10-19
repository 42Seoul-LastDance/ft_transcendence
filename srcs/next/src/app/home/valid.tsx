import { Dispatch } from 'react';
import { Action } from 'redux';
import { myAlert } from './alert';

export const isValid = (
  comment: string,
  input: string | null,
  length: number,
  dispatch: Dispatch<Action>,
): boolean => {
  const isEmptyInput = (): boolean => {
    if (!input?.trim()) {
      const alertMessage = `${comment} 비었습니다.`;
      myAlert('error', alertMessage, dispatch);
      return true;
    }
    return false;
  };

  const isOverInput = (): boolean => {
    if (input && input.length > length) {
      const alertMessage = `${comment} 너무 깁니다. : ${length}자 제한`;
      myAlert('error', alertMessage, dispatch);
      return true;
    }
    return false;
  };

  const isRegexInput = (): boolean => {
    const invalidCharacters: RegExp = /["'\n=+<>]/g;
    if (input && invalidCharacters.test(input)) {
      const alertMessage = `${comment} 유효하지 않은 특수문자입니다. : ${input}`;
      myAlert('error', alertMessage, dispatch);
      return true;
    }
    return false;
  };

  if (isOverInput() || isEmptyInput() || isRegexInput()) return false;
  else return true;
};
