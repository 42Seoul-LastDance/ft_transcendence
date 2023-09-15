FROM	node:latest

WORKDIR /usr/app

COPY    ./init_nest.sh /usr/app/

RUN		apt-get update \
		&& apt-get install -y dumb-init \
		&& npm install -g npm \
        && chmod 777 init_nest.sh


ENTRYPOINT	["/usr/bin/dumb-init", "--"]

CMD		["sh", "init_nest.sh"]