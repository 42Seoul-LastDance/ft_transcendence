NAME	= .transcendence

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
	echo "y" | ./utils/init_docker.sh

stest	:
	docker exec nest curl http://localhost:3000

xtest	:
	docker exec next curl http://localhost:3000

next	:
	docker exec -it next npx create-next-app srcs/my-app
	docker exec next npm --prefix srcs/my-app run dev

.PHONY	: all down clean fclean docker compile cntest stest xtest next