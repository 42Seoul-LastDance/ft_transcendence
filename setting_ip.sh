line_address=$(grep -n "#local BACK Address" .env | cut -d: -f1)
if [ -z "$line_address" ]; then
    IPADD="$(ifconfig | grep "inet 10" | head -1 | awk '{print $2}')"
    echo "" >> .env
    echo "#local BACK Address" >> .env
    echo "BACK_URL=http://$IPADD:3000" >> .env
    echo "#next public BACK Address" >> .env
    echo "NEXT_PUBLIC_BACK_URL=http://10.14.6.6:3000" >> .env
    echo "#local FRONT Address" >> .env
    echo "FRONT_URL=http://$IPADD:4242" >> .env
    echo "#local callback Address" >> .env
    echo "FT_CALLBACK=http://$IPADD:3000/auth/callback" >> .env
fi
