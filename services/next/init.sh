echo "----- Start installing npm dependencies -----"

npm install --prefix srcs next
npm install --prefix srcs --save @headlessui/react
# npm install --prefix srcs --save redux react-redux @reduxjs/toolkit react-devtools
# npm install --prefix srcs --save react-router-dom react-cookie jsonwebtoken
# npm install --prefix srcs --save react-unity-webgl nextjs-unity-webgl
# npm install --prefix srcs --save axios axios-auth-refresh
# npm install --prefix srcs --save @typescript-eslint
# npm install --prefix srcs --save turbo

npm update --prefix srcs next @headlessui/react redux react-redux @reduxjs/toolkit react-devtools react-router-dom react-cookie jsonwebtoken react-unity-webgl nextjs-unity-webgl axios axios-auth-refresh @typescript-eslint turbo
echo "----- Successfully installed -----"

npm --prefix srcs run dev --cache-clear
