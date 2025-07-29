from application.models import ParkingSpot, User, Role, Reservation, ParkingLot
from application.database import db
from datetime import datetime, time, timedelta, date
from jinja2 import Template

def roles_list(roles):
    return [role.name for role in roles]


def get_reserved_spots_count(lot_id):
    return ParkingSpot.query.filter_by(lot_id = lot_id, status="occupied").count()

def get_duration(parking_timestamp):
    current_time = datetime.now()
    duration = current_time - parking_timestamp

    duration_in_seconds = int(duration.total_seconds())
    duration_in_min = duration_in_seconds//60
    duration_in_hr = round(duration_in_min/60, 2)
    duration_min = duration_in_min % 60
    duration_hr = duration_in_min // 60

    return {
        "duration_in_seconds": duration_in_seconds,
        "duration_in_min": duration_in_min,
        "duration_in_hr": duration_in_hr,
        "duration_min": duration_min,
        "duration_hr": duration_hr
    }

def format_report(html_template, data):
    with open(html_template) as file:
        template = Template(file.read())
        return template.render(data = data)


def get_monthly_report_data(user_id):
    now = datetime.now()
    first_day = datetime(now.year, now.month - 1, 1)
    last_day = datetime(now.year, now.month, 1)

    reservations = (
        Reservation.query
        .join(ParkingSpot)
        .join(ParkingLot)
        .filter(Reservation.user_id == user_id)
        .filter(Reservation.parking_timestamp >= first_day)
        .filter(Reservation.parking_timestamp < last_day)
        .all()
    )

    total_bookings = len(reservations)
    total_cost = sum(r.parking_cost for r in reservations)

    lot_usage = {}
    for r in reservations:
        lot_name = r.spot.parking_lot.pl_name
        lot_usage[lot_name] = lot_usage.get(lot_name, 0) + 1

    most_used_lot = max(lot_usage.items(), key=lambda x: x[1])[0] if lot_usage else "N/A"

    return {
        "total_bookings": total_bookings,
        "total_cost": total_cost,
        "most_used_lot": most_used_lot,
        "reservations": reservations
    }

def has_visited(user_id):
    today = date.today()
    start_time = datetime.combine(today, time(0, 0))      # 12:00 AM today
    end_time = datetime.combine(today, time(20, 0))       # 8:00 PM today

    return Reservation.query.filter(
        Reservation.user_id == user_id,
        Reservation.parking_timestamp >= start_time,
        Reservation.parking_timestamp < end_time
    ).count() > 0

def admin_created_new_lots():
    now = datetime.now()
    end_time = datetime.combine(now.date(), time(20, 0))  # today at 8:00 PM
    start_time = end_time - timedelta(days=1)             # yesterday at 8:00 PM

    return ParkingLot.query.filter(
        ParkingLot.created_at >= start_time,
        ParkingLot.created_at < end_time
    ).all()