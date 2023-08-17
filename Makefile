NAME		= .transcendence

all		: $(NAME)

$(NAME) :
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
	docker exec node npx tsc ./srcs/*.ts

.PHONY	: all down clean fclean docker compile