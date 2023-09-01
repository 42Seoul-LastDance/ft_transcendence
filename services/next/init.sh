echo "----- Start installing npm dependencies -----"

npm install --prefix srcs next

echo "----- Successfully installed -----"

npm --prefix srcs run dev