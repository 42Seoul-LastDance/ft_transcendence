echo "----- Start installing npm dependencies -----"

npm install --prefix srcs next

npm install --prefix srcs --save redux react-redux @reduxjs/toolkit react-devtools react-router-dom react-cookie jsonwebtoken
npm install --prefix srcs --save react-unity-webgl nextjs-unity-webgl
npm install --prefix srcs --save axios axios-auth-refresh
npm install --prefix srcs --save ws socket.io utf-8-validate bufferutil
npm install --prefix srcs --save @typescript-eslint
npm install --prefix srcs --save @mui/material @emotion/react @emotion/styled @fontsource/roboto @mui/icons-material

echo "----- Successfully installed -----"

npm --prefix srcs run dev --cache-clear


