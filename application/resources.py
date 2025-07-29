from flask_restful import Resource, Api, reqparse, fields, marshal 
from flask_security import auth_required, current_user, roles_required, roles_accepted
import datetime

from .models import *
from .utils import roles_list, get_reserved_spots_count

api = Api()

class ParkingLotApi(Resource):
    def __init__(self):
        self.lot_args = reqparse.RequestParser() 
        self.lot_args.add_argument('pl_name')
        self.lot_args.add_argument('price')
        self.lot_args.add_argument('address')
        self.lot_args.add_argument('pincode')
        self.lot_args.add_argument('capacity')

    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, lot_id=None):
        # print("hello from get parking lot")
        if lot_id:
            parking_lot = ParkingLot.query.get(lot_id)
            if parking_lot:
                lot_json = {}
                lot_json['id'] = parking_lot.id
                lot_json['pl_name'] = parking_lot.pl_name
                lot_json['price'] = parking_lot.price
                lot_json['address'] = parking_lot.address
                lot_json['pincode'] = parking_lot.pincode
                lot_json['capacity'] = parking_lot.capacity
                lot_json['spots_count'] = parking_lot.spots_count
                lot_json['created_at'] = parking_lot.created_at.isoformat()
                return lot_json

            return {
                "message": "Parking lot not found"
            }, 404
        parking_lots = ParkingLot.query.all()
        lot_json = []
        for lot in parking_lots:
            this_lot = {}
            this_lot['id'] = lot.id
            this_lot['pl_name'] = lot.pl_name
            this_lot['price'] = lot.price
            this_lot['address'] = lot.address
            this_lot['pincode'] = lot.pincode
            this_lot['created_at'] = lot.created_at.isoformat()
            this_lot['capacity'] = lot.capacity
            this_lot['spots_count'] = lot.spots_count
            lot_json.append(this_lot)

        if lot_json:
            return lot_json
        
        return {
            "message": "No parking lots found"
        }, 404

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = self.lot_args.parse_args()
        try:
            parking_lot = ParkingLot(
                pl_name=args['pl_name'],
                price=args['price'],
                address=args['address'],
                pincode=args['pincode'],
                capacity=args['capacity'],
                spots_count=args['capacity'],
                created_at=datetime.datetime.now(),
            )
            db.session.add(parking_lot)
            db.session.flush()  # Get parking_lot.id before commit

            # Create spots
            for i in range(int(args['capacity'])):
                spot = ParkingSpot(lot_id=parking_lot.id)
                db.session.add(spot)
            db.session.commit()
            return {
                "message": "Parking lot created successfully"
            }
        except:
            return {
                "message": "Error creating parking lot"
            }, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, lot_id):
        args = self.lot_args.parse_args()
        parking_lot = ParkingLot.query.get(lot_id)
        parking_lot.pl_name = args['pl_name']
        parking_lot.price = args['price']
        parking_lot.address = args['address']
        parking_lot.pincode = args['pincode']
        db.session.commit()
        return {
            "message": "Parking lot updated successfully"
        }

    @auth_required('token')
    @roles_required('admin')
    def delete(self, lot_id):
        parking_lot = ParkingLot.query.get(lot_id)

        if parking_lot:
            occupied_spots = get_reserved_spots_count(lot_id)
            if occupied_spots > 0:
                return {
                    "message": "Cannot delete the parking lot with occupied spots"
                }, 400
            db.session.delete(parking_lot)
            db.session.commit()  
            return {
                'message': 'parking lot deleted successfully'
            }, 200          
        else:
            return {
                "message": "Parking lot not found"
            }, 404


class ParkingSpotApi(Resource):
    def __init__(self):
        self.parking_spot = reqparse.RequestParser()
        self.parking_spot.add_argument('status')
    
    def get(self, spot_id=None):
        if spot_id:
            parking_spot = ParkingSpot.query.get(spot_id)
            if parking_spot:
                spot_json = {}
                spot_json['id'] = parking_spot.id
                spot_json['status'] = parking_spot.status
                return spot_json

            return {
                "message": "Parking spot not found"
            }, 404
        parking_spots = ParkingSpot.query.all()
        spot_json = []
        for spot in parking_spots:
            this_spot = {}
            this_spot['id'] = spot.id
            this_spot['status'] = spot.status
            spot_json.append(this_spot)

        if spot_json:
            return spot_json
        
        return {
            "message": "No parking spots found"
        }, 404

    def post(self, lot_id):
        parking_lot = ParkingLot.query.get(lot_id)
        if parking_lot.spots_count < parking_lot.capacity:
            spot = ParkingSpot(lot_id = lot_id)
            parking_lot.spots_count += 1
            db.session.add(spot)
            db.session.commit()
            return {
                'message': 'parking spot added successfully'
            }, 201
        else:
            return {
                'message': 'parking lot is full'
            }, 400


    def put(self, spot_id):
        args = self.parking_spot.parse_args()
        parking_spot = ParkingSpot.query.get(spot_id)
        parking_spot.status = args['status']
        db.session.commit()
        return {
            "message": "Parking spot updated successfully"
        }

    def delete(self, spot_id):
        parking_spot = ParkingSpot.query.get(spot_id)
        if parking_spot:
            db.session.delete(parking_spot)
            spot_lot = ParkingLot.query.get(parking_spot.lot_id)
            spot_lot.spots_count -= 1
            db.session.commit()
            return {
                "message": "Parking spot deleted successfully"
            }
        else:
            return {
                "message": "Parking spot not found"
            }, 404

class ReserveSpotApi(Resource):
    def __init__(self):
        self.reserve_slot = reqparse.RequestParser()

        self.reserve_slot.add_argument('spot_id')
        self.reserve_slot.add_argument('user_id')
        self.reserve_slot.add_argument('vrn')
        self.reserve_slot.add_argument('parking_timestamp')
        self.reserve_slot.add_argument('leaving_timestamp')
        self.reserve_slot.add_argument('status')
        self.reserve_slot.add_argument('parking_cost')
    
    @auth_required('token')
    @roles_accepted('user', 'admin')
    def get(self):
        reserved_spots = []
        reserve_json = []
        if "admin" in roles_list(current_user.roles):
            reserved_spots = Reservation.query.all()
        else:
            reserved_spots = current_user.spots

        for reserved_spot in reserved_spots:
            this_reservation = {}
            this_reservation['id'] = reserved_spot.id
            this_reservation['spot_id'] = reserved_spot.spot_id
            this_reservation['lot_id'] = reserved_spot.spot.lot_id
            this_reservation['user_id'] = reserved_spot.user_id
            this_reservation['parking_timestamp'] = reserved_spot.parking_timestamp.isoformat()
            this_reservation['leaving_timestamp'] = reserved_spot.leaving_timestamp.isoformat()
            this_reservation['status'] = reserved_spot.status
            this_reservation['parking_cost'] = reserved_spot.parking_cost
            reserve_json.append(this_reservation)

        if reserve_json:
            return reserve_json
        
        return {
            "message": "No reservations found"
        }, 404

    def post(self, user_id, spot_id):
        args = self.reserve_slot.parse_args()
        # try:
        reservation = Reservation(
            spot_id=spot_id,
            user_id=user_id,
            parking_timestamp=datetime.datetime.now(),
            vrn=args['vrn'],
        )
        spot = ParkingSpot.query.get(spot_id)
        spot.status = "occupied"

        db.session.add(reservation)
        db.session.commit()
        return {
            "message": "Reservation created successfully"
        }
        # except :
        #     return {
        #         "message": "Error creating reservation"
        #     }, 400
    
    @auth_required('token')
    @roles_accepted('admin')    
    def put(self, reserve_id):
        args = self.reserve_slot.parse_args()
        reservation = Reservation.query.get(reserve_id)
        reservation.spot_id = args['spot_id']
        reservation.user_id = args['user_id']
        reservation.parking_timestamp = args['parking_timestamp']
        reservation.leaving_timestamp = args['leaving_timestamp']
        reservation.status = args['status']
        reservation.parking_cost = args['parking_cost']
        db.session.commit()
        return {
            "message": "Reservation updated successfully"
        }

    @auth_required('token')
    @roles_accepted('user')
    def delete(self, reserve_id):
        reservation = Reservation.query.get(reserve_id)
        if reservation:
            db.session.delete(reservation)
            db.session.commit()
            return {
                "message": "Reservation deleted successfully"
            }
        else:
            return {
                "message": "Reservation not found"
            }, 404

class UserApi(Resource):
    def __init__(self):
        self.user = reqparse.RequestParser()
        self.user.add_argument('username')

    def get(self):
        users = User.query.all()
        user_json = []
        for user in users[1:]:
            this_user = {}
            this_user['id'] = user.id
            this_user['email'] = user.email
            this_user['username'] = user.username
            this_user['active'] = user.active
            this_user['roles'] = roles_list(user.roles)
            user_json.append(this_user)
        
        if user_json:
            return user_json
        
        return {
            "message": "No users found "
        }, 404

    def put(self, user_id):
        args = self.user.parse_args()
        user = User.query.get(user_id)
        user.username = args['username']
        db.session.commit()
        return {
            "message": "User updated successfully"
        }

    def delete(self, user_id):
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return {
                "message": "User deleted successfully"
            }
        else:
            return {
                "message": "User not found"
            }, 404
        
api.add_resource(ReserveSpotApi, '/api/reserve_slot/get',
                                 '/api/reserve_slot/<int:user_id>/create/<int:spot_id>',
                                 '/api/reserve_slot/update/<int:reserve_id>',
                                 '/api/reserve_slot/delete/<int:reserve_id>')
api.add_resource(ParkingLotApi,  '/api/parking_lot/get',
                                 '/api/parking_lot/get/<int:lot_id>',
                                 '/api/parking_lot/create',
                                 '/api/parking_lot/update/<int:lot_id>',
                                 '/api/parking_lot/delete/<int:lot_id>')
api.add_resource(ParkingSpotApi, '/api/parking_spot/get/<int:spot_id>',
                                 '/api/parking_spot/get',
                                 '/api/parking_spot/create/<int:lot_id>',
                                 '/api/parking_spot/update/<int:spot_id>',
                                 '/api/parking_spot/delete/<int:spot_id>')
api.add_resource(UserApi, '/api/user/get',
                                 '/api/user/update/<int:user_id>',
                                 '/api/user/delete/<int:user_id>')