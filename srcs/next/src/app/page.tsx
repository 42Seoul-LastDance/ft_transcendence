import React from "react";
import { Provider } from "react-redux";
import store from "./redux/store"; // store의 경로는 실제 프로젝트에 맞게 수정하세요.
import Test from "./redux/Test"; // Test 컴포넌트의 경로는 실제 프로젝트에 맞게 수정하세요.
import InputForm from "./component/multi/InputForm";
import LoginButton from "./component/single/LoginButton";
import Link from "next/link";
import { CookiesProvider } from "react-cookie";
// import RegisterHome from "./register/page";

const Home = () => {
	return (
		<main>
			<h1> Welcome! </h1>
			<Link href="http://10.14.9.4:3000/auth/42login"> Login </Link>
			<br/><br/><br/><Link href="/register"> TempButton </Link>
			{/* <LoginButton/> */}
			{/* <RegisterHome/> */}
		</main>
	);
}

export default Home;