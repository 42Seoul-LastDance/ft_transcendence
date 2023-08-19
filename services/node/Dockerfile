FROM	node:latest

WORKDIR /usr/app

RUN		apt-get update \
		&& apt-get install -y dumb-init \
		&& npm install -g npm \
		&& npm install typescript --save-dev \
		&& npm install express pg cors \
		&& npx tsc --init

ENTRYPOINT	["/usr/bin/dumb-init", "--"]

CMD		["tail", "-f"]