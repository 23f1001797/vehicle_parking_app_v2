# this is my MAD-2 project.

# terminal Commands:

- to start mailhog:
~/go/bin/MailHog

- to start redis-server:
redis-server

- to stop redis-server:
sudo systemctl stop redis

- to start celery beat:
celery -A app.celery beat --loglevel INFO

- to start celery worker:
celery -A app.celery worker --loglevel INFO

- to start the application:
python3 app.py