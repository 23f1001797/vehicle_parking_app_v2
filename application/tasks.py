from celery import shared_task
from .models import User, Reservation, ParkingSpot, ParkingLot
from .utils import format_report, get_monthly_report_data, admin_created_new_lots, has_visited
import datetime
import csv
from .mail import send_email
import requests # plural


@shared_task(ignore_result=False, name = "download_csv_report")
def csv_report(user_id=None):
    if user_id:
        reservations = Reservation.query.filter(Reservation.user_id == user_id).all()
    else:
        reservations = Reservation.query.all()
        
    if reservations:
        if user_id:
            csv_file_name = f'reservations_userfile_{user_id}_{datetime.datetime.now().strftime("%f")}.csv'
        else:
            csv_file_name = f'reservations_{datetime.datetime.now().strftime("%f")}.csv'   # "transactions_123456.csv"
    
        with open(f'static/csv_folder/{csv_file_name}', "w", newline = "") as csv_file:
            sr_no = 1
            trans_csv = csv.writer(csv_file, delimiter=",")
            # print("trans_csv")
            if user_id:
                trans_csv.writerow(["Sr No.", "Spot ID", "Lot Name", "VRN", "Start Time", "End Time", "Cost"])
                for r in reservations:
                    this_trans = [sr_no, r.spot_id, r.spot.lot.pl_name, r.vrn, r.parking_timestamp, r.leaving_timestamp, r.parking_cost]
                    trans_csv.writerow(this_trans)
                    sr_no += 1
            else:
                trans_csv.writerow(["Sr No.", "Spot ID", "Lot Name", "Customer Name", "VRN", "Start Time", "End Time", "Cost"])
                for r in reservations:
                    this_trans = [sr_no, r.spot_id, r.spot.lot.pl_name, r.bearer.username, r.vrn, r.parking_timestamp, r.leaving_timestamp, r.parking_cost]
                    trans_csv.writerow(this_trans)
                    sr_no += 1
        return csv_file_name
    return "No reservations found!"




@shared_task(ignore_result=False, name = "monthly_reports")
def monthly_report():
    users = User.query.all()
    for user in users[1:]:
        user_data = {}
        user_data['username'] = user.username
        user_data['email'] = user.email

        data = get_monthly_report_data(user.id)

        user_data['total_bookings'] = data['total_bookings']
        user_data['total_cost'] = data['total_cost']
        user_data['most_used_lot'] = data['most_used_lot']
        user_data['reservations'] = data['reservations']


        message = format_report("templates/mail_details.html", user_data)
        send_email(user.email, "Monthly Report", message)

    return "Monthly report sent successfully!"

@shared_task(ignore_result=False, name = "daily_reminder")
def daily_reminder():
    users = User.query.all()
    new_lots = admin_created_new_lots()
    if new_lots:
        lot_details = ""
        for lot in new_lots:
            lot_name = lot.pl_name
            lot_address = lot.address
            lot_capacity = lot.capacity
            lot_details += f"Lot name: {lot_name}, Lot address: {lot_address}, Lot capacity: {lot_capacity}\n"
        
        for user in users[1:]:
            lot_message = f"Hey {user.username}! New parking lots has been added.\n{lot_details} \n"
            message = lot_message
            response = requests.post("https://chat.googleapis.com/v1/spaces/AAQAPXoTT4U/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=X_yas9DjSGS4jUKadPfSMvX_OkwZi6MAd4N8P1-2Q4c", headers = {"Content-Type": "application/json"}, 
                            json={"text": message})
            print(response.status_code)

    for user in users[1:]:
        if not has_visited(user.id):
            message = f"Hey {user.username}! You have not booked any parking spot yet to it before it's too late!"
            
            response = requests.post("https://chat.googleapis.com/v1/spaces/AAQAPXoTT4U/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=X_yas9DjSGS4jUKadPfSMvX_OkwZi6MAd4N8P1-2Q4c", headers = {"Content-Type": "application/json"}, 
                            json={"text": message}) # key can be anything we want, but in this google chats expected field is "text" that's why we are using "text" as key in json
            print(response.status_code)
    return "daily reminder sent successfully!"


