NAME		= .transcendence

all		: $(NAME)

$(NAME) :
	mkdir -p $(PWD)/srcs
	docker-compose up --build

down	: 
	docker-compose down
	@rm -rf $(NAME)

clean	:
	make down
	docker system prune -a

fclean	:
	make clean
	docker volume rm -f transcendence_srcs

re		:
	make fclean
	make all

docker	:
	chmod 777 ./utils/init_docker.sh
	echo "y" | ./utils/init_docker.sh

compile	:
	docker exec node npx tsc ./srcs/*.ts

.PHONY	: all down clean fclean docker compile