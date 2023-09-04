echo "----- Start installing npm dependencies -----"

npm install --prefix srcs react
npm install --prefix srcs --save react-unity-webgl

echo "----- Successfully installed -----"

npm --prefix srcs start dev