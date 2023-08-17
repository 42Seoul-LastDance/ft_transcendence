NAME		= .transcendence

all		: $(NAME)

$(NAME) :
	mkdir -p $(HOME)/Desktop/transcendence/srcs
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

compile	:
	docker exec node npx tsc ./srcs/*.ts

.PHONY	: all down clean fclean re en