import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store"; // store의 경로는 실제 프로젝트에 맞게 수정하세요.
import Test from "./redux/Test"; // Test 컴포넌트의 경로는 실제 프로젝트에 맞게 수정하세요.
import Clock from "./Clock"; // Clock 컴포넌트의 경로는 실제 프로젝트에 맞게 수정하세요.
import InputForm from "./component/multi/InputForm";

const Home: React.FC = () => {
  return (
    <main>
      <Provider store={store}>
        <Test/>
      </Provider>

      {/* <Game /> */}
      <Clock />
      <InputForm />

      {/* <App /> */}
      {/* <AxiosComponent url='http://10.12.4.3:3000'></AxiosComponent> */}
      {/* <HandleLoginButton /> */}
    </main>
  );
}

export default Home;