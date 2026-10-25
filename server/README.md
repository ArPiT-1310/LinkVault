# LinkVault server (Spring Boot 3, Java 17, MySQL)

## Prerequisites
- JDK 17+
- Maven 3.9+
- MySQL 8 running on localhost:3306

## Configure
Edit `src/main/resources/application.properties` (or set environment variables):

| Setting | Env variable | Default |
|---|---|---|
| MySQL user | `DB_USERNAME` | `root` |
| MySQL password | `DB_PASSWORD` | `your_mysql_password` |
| JWT secret (32+ chars) | `JWT_SECRET` | placeholder, change it |
| Allowed frontend origins | `CORS_ORIGINS` | `http://localhost:5173` |

The `linkvault` database and all tables are created automatically on first start.

## Run
    mvn spring-boot:run      # http://localhost:8080
    mvn test

## API
| Method | Endpoint | Auth |
|---|---|---|
| POST | /api/auth/register | no |
| POST | /api/auth/login | no |
| GET | /api/bookmarks?search&category&tag&favorite&sort&page&size | yes |
| POST | /api/bookmarks | yes |
| PUT | /api/bookmarks/{id} | yes |
| DELETE | /api/bookmarks/{id} | yes |
| PATCH | /api/bookmarks/{id}/favorite | yes |
| GET | /api/bookmarks/meta?url= | yes |
| GET | /api/tags | yes |
