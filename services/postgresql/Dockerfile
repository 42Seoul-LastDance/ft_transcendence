FROM postgres:latest

RUN apt-get update

RUN mkdir -p /var/lib/postgresql/data
RUN chown -R postgres:postgres /var/lib/postgresql/data

ARG DB_NAME
ARG POSTGRES_USER_ID
ARG POSTGRES_USER_PASSWORD

RUN echo "CREATE DATABASE ${DB_NAME};" > /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "CREATE USER ${POSTGRES_USER_ID} WITH SUPERUSER PASSWORD '${POSTGRES_USER_PASSWORD}';" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${POSTGRES_USER_ID};" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "\\\c ${DB_NAME};" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "CREATE TABLE player (id SERIAL PRIMARY KEY, name VARCHAR(255), password VARCHAR(255), point INTEGER);" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "INSERT INTO player (id, name, password, point) VALUES ('1', 'juhoh', 'awesome', 100);" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "ALTER TABLE player OWNER TO ${POSTGRES_USER_ID};" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${POSTGRES_USER_ID};" >> /docker-entrypoint-initdb.d/init_psql.sql && \
    echo "GRANT ALL PRIVILEGES ON SCHEMA public TO ${POSTGRES_USER_ID};" >> /docker-entrypoint-initdb.d/init_psql.sql

RUN chown postgres:postgres /docker-entrypoint-initdb.d/init_psql.sql
USER postgres

CMD ["postgres", "-D", "/var/lib/postgresql/data"]
