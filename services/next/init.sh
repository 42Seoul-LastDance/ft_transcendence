echo "----- Start installing npm dependencies -----"


npm install --prefix srcs next
npm install --prefix srcs --save socket.io-client
npm install --prefix srcs --save ws
npm install --prefix srcs --save utf-8-validate
npm install --prefix srcs --save bufferutil
npm install --prefix srcs --save @headlessui/react
npm install --prefix srcs --save redux
npm install --prefix srcs --save react-redux
npm install --prefix srcs --save @reduxjs/toolkit
# npm install --prefix srcs --save react-unity-webgl
# npm install --prefix srcs --save nextjs-unity-webgl
npm install --prefix srcs --save axios
npm install --prefix srcs --save axios-auth-refresh
npm install --prefix srcs --save react-router-dom
npm install --prefix srcs --save @mui/material @emotion/react @emotion/styled @fontsource/roboto @mui/icons-material

echo "----- Successfully installed -----"

npm --prefix srcs run dev
