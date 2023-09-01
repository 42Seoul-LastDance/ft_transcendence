FROM	node:latest

WORKDIR /usr/app

RUN		apt-get update \
		&& apt-get install -y dumb-init \
		&& npm install -g npm \
		&& npm install -g @nestjs/cli

ENTRYPOINT	["/usr/bin/dumb-init", "--"]

CMD		["npm", "--prefix", "srcs", "run", "start:dev"]