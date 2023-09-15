'use client'

import { Provider } from "react-redux";
import store from "../redux/store";
import { setName, setImageUrl } from "../redux/userSlice"
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { userState } from "../redux/userSlice";

const CheckDuplicatebuttonContent = () => {
	const dispatch = useDispatch();
	const userName = useSelector((state: userState) => state.name);

	// console.log("state.username: " + userName);
	const checkDuplicate = async() => {
		//const inputName = 
		try{
			//alert("inputname: " + userName);
			const response = await axios.get("http://10.14.9.4:3000/users/username/testUser");
			alert('asdas');
			dispatch(setName("testUser"));
			console.log("correct");
		} catch(error) {
			console.log("dup");
		}
		{userName ? (
			<div>
				<h2>사용 가능한 닉네임입니다!</h2>
			</div> ) : (
			<div>
				<h2>중복된 닉네임입니다!</h2>
			</div> )
		}
	  }

	const myOnChange = () => {
		dispatch(setName(userName));
	}

	return (
		<div>
			<input type="text" id="nickname" value={userName} onChange={myOnChange}/>
			<button onClick={checkDuplicate}> Check Duplicate </button>
		</div>
	)
};

const CheckDuplicatebutton = () => {
	return (
		<Provider store={store}>
			<CheckDuplicatebuttonContent/>
		</Provider>
	)
};

export default CheckDuplicatebutton;