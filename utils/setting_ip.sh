#!/bin/bash

add_env_line() {
    local key="$1"
    local value="$2"
    echo "$key" >> .env
    echo "$value" >> .env
}

if ! grep -q "#next public BACK URL" .env; then
    IP_ADDRESS="$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)"
    echo "" >> .env
    add_env_line "#next public BACK URL" "NEXT_PUBLIC_BACK_URL=http://$IP_ADDRESS:3000"
    add_env_line "#local FRONT URL" "FRONT_URL=http://$IP_ADDRESS:4242"
    add_env_line "#local callback URL" "FT_CALLBACK=http://$IP_ADDRESS:3000/auth/callback"
fi
