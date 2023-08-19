FROM	postgres:latest

RUN		apt-get update

RUN mkdir -p /var/lib/postgresql/data
RUN chown -R postgres:postgres /var/lib/postgresql/data

# COPY	tools/init_psql.sql	/docker-entrypoint-initdb.d/init_psql.sql

# 환경 변수를 ARG로 정의
ARG DB_NAME
ARG POSTGRES_USER_ID
ARG POSTGRES_USER_PASSWORD

# 환경 변수를 init_psql.sql 파일에 삽입
RUN echo "CREATE DATABASE ${DB_NAME};" > /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "CREATE USER ${POSTGRES_USER_ID} WITH PASSWORD '${POSTGRES_USER_PASSWORD}';" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${POSTGRES_USER_ID};" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "\\\c ${DB_NAME};" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "CREATE TABLE player (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), password VARCHAR(255), point INTEGER);" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "INSERT INTO player (id, name, password, point) VALUES ('1', 'juhoh', 'awesome', 100);" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${POSTGRES_USER_ID};" >> /docker-entrypoint-initdb.d/init_psql.sql

########### test code ########################
RUN echo "\d" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "SELECT * FROM player;" >> /docker-entrypoint-initdb.d/init_psql.sql
##############################################

# 포어그라운드 모드로 PostgreSQL 서버 시작
CMD ["postgres", "-D", "/var/lib/postgresql/data"]
