FROM	node:latest

WORKDIR /usr/app

RUN		apt-get update \
		&& apt-get install -y dumb-init \
		&& npm install -g npm \
		&& npm install typescript --save-dev \
		&& npx tsc --init \

COPY	./srcs .

ENTRYPOINT	["/usr/bin/dumb-init", "--"]

CMD		["tail", "-f"]