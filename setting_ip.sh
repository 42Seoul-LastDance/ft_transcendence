line_address=$(grep -n "#local BACK Address" .env | cut -d: -f1)
if [ -z "$line_address" ]; then
    IPADD="$(ifconfig | grep "inet" | head -1 | awk '{print $2}')"
    echo "" >> .env
    echo "#local BACK Address" >> .env
    echo "BACK_ADDR=http://$IPADD:3000" >> .env
    echo "#local FRONT Address" >> .env
    echo "FRONT_ADDR=http://$IPADD:4242" >> .env
    echo "#local callback Address" >> .env
    echo "FT_CALLBACK=http://$IPADD:3000/auth/callback" >> .env
fi
