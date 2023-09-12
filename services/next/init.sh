echo "----- Start installing npm dependencies -----"

npm install --prefix srcs next
# npm install --prefix srcs --save redux
# npm install --prefix srcs --save react-redux
# npm install --prefix srcs --save @reduxjs/toolkit
# npm install --prefix srcs --save react-unity-webgl
# npm install --prefix srcs --save nextjs-unity-webgl
# npm install --prefix srcs --save axios
# npm install --prefix srcs --save axios-auth-refresh
# npm install --prefix srcs --save react-router-dom
npm update --prefix srcs react react-dom redux react-redux next @reduxjs/toolkit

echo "----- Successfully installed -----"

npm --prefix srcs run dev --cache-clear
