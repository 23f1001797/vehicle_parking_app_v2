from flask import Flask
from flask_security import SQLAlchemyUserDatastore, Security, hash_password
from celery.schedules import crontab

from application.config import LocalDevelopmentConfig
from application.database import db
from application.models import User, Role
from application.resources import api
from application.celery_init import celery_init_app
from application.tasks import daily_reminder

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    db.init_app(app)
    api.init_app(app)

    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)

    app.app_context().push()
    return app

app = create_app()

celery = celery_init_app(app)
celery.autodiscover_tasks()

with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name = "admin", description = "Super User")
    app.security.datastore.find_or_create_role(name = "user", description = "User")

    db.session.commit()

    if not app.security.datastore.find_user(email = "user0@gmail.com"):
        app.security.datastore.create_user(
            email = "user0@gmail.com",
            username = "admin",
            password = hash_password("1111"),
            roles = ['admin']
        )
    db.session.commit()

from application.routes import *

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute = '*/2'),
        monthly_report.s(),
    )
    
    sender.add_periodic_task(
        crontab(minute = '*/1'),
        daily_reminder.s(),
    )


if __name__ == "__main__":
    app.run()