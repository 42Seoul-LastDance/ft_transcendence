import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store"; // store의 경로는 실제 프로젝트에 맞게 수정하세요.
import Test from "./redux/Test"; // Test 컴포넌트의 경로는 실제 프로젝트에 맞게 수정하세요.
import InputForm from "./component/multi/InputForm";
import LoginButton from "./component/single/LoginButton";
import Link from "next/link";

const Home = () => {
	return (
		<main>
			<h1> HOME </h1>
			<LoginButton/>
		</main>
	);
}

export default Home;