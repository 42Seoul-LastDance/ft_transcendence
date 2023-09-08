echo "----- Start installing npm dependencies -----"

npm install --prefix srcs next
npm install --prefix srcs --save react-unity-webgl
npm install --prefix srcs --save nextjs-unity-webgl

echo "----- Successfully installed -----"

npm --prefix srcs run dev