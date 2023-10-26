'use client'

import React, { useState } from "react";
import RegisterButton from "./RegisterButton";
import CheckDuplicatebutton from "./CheckDuplicatebutton";

const RegisterHome: React.FC = () => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 이미지 선택 여부를 체크
  };

  return (
    <div>
      <h1>Register Page!!</h1>
      <div>
        <form id="imageForm" encType="multipart/form-data">
          <label htmlFor="imageUpload">이미지 업로드 (500x500): </label>
          <input type="file" id="imageUpload" accept="image/*" required onChange={handleImageUpload} />
        </form>

		<br/>

      <form id="nicknameForm">
        <label htmlFor="nickname">닉네임: </label>
      	<CheckDuplicatebutton/>
      </form>

      <br/>
        <RegisterButton/>
      </div>
    </div>
  );
};

export default RegisterHome;