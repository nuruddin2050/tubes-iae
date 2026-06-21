TODO - order-service Docker repair

- [x] Verify current Dockerfile/docker-compose.yml/migrations presence
- [x] Identify root failure: app migrations run before MySQL reachable + MySQL env misconfiguration (MYSQL_USER=root)
- [ ] Overwrite Dockerfile to required spec (php:8.4-cli + deps + extensions + composer install ignore-platform-reqs + serve on :8000)
- [ ] Overwrite docker-compose.yml to required spec (app/mysql/rabbitmq, app depends_on, sleep 10 before migrate, required final command, port mappings incl rabbitmq, no MySQL host port)
- [ ] Overwrite .env with required DB values
- [ ] Verify duplicate order_items migrations after scan (disable/remove only if found)
- [ ] docker compose up --build
- [ ] Confirm app container stays UP
- [ ] Confirm php artisan migrate --force succeeds
- [ ] Confirm php artisan route:list works
- [ ] Confirm API reachable at http://localhost:8000

