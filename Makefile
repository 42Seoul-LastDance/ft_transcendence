NAME		= .transcendence

all		: $(NAME)

$(NAME) :
	mkdir -p ./srcs/postgresql
	docker-compose up --build

down	: 
	docker-compose down
	@rm -rf $(NAME)

clean	:
	make down
	docker system prune -af

fclean	:
	make clean
	docker volume rm $$(docker volume ls -q -f dangling=true) || docker volume ls

re		:
	make fclean
	make all

docker	:
	chmod 777 ./utils/init_docker.sh
	echo "y" | ./utils/init_docker.sh

compile	:
	docker exec node npx tsc $(ls ./srcs/ | grep .ts$)

cntest	:
	docker exec nest curl http://localhost:3000

run :
	docker exec nest npm --prefix srcs run start

restart :
	docker exec nest npm --prefix srcs run restart

.PHONY	: all down clean fclean docker compile cntest run stop renest
