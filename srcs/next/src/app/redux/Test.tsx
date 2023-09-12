import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";


declare module 'react' {
	interface JSX {
	  // 추가하려는 요소의 이름과 타입을 지정합니다.
	  // 예: <main> 요소를 추가하는 경우
	  // 'main'이라는 문자열을 키로 사용하고, React.HTMLProps<HTMLElement> 타입을 값으로 지정합니다.
	  // 다른 요소도 필요한 경우 비슷한 방식으로 추가할 수 있습니다.
	  // 참고: HTMLProps는 일반적인 HTML 요소에 대한 속성을 포함하고 있습니다.
	  // 더 구체적인 요소의 경우 관련 타입을 사용할 수 있습니다.
	  'main': React.HTMLProps<HTMLElement>;
	}
}

const Test: React.FC = () => {
  const number = useSelector((state: RootState) => state.my.value);

  return (
    <div>
      <h1> Test : {number} </h1>
    </div>
  );
}

export default Test;