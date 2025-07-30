from flask_restful import Resource, Api, reqparse, fields, marshal 
from flask_security import auth_required, current_user, roles_required, roles_accepted, hash_password
import datetime

from .models import *
from .utils import roles_list, get_reserved_spots_count
from cache import cache

api = Api()

parking_lot_fields = {
    'id': fields.Integer,
    'pl_name': fields.String,
    'price': fields.Integer,
    'address': fields.String,
    'pincode': fields.Integer,
    'capacity': fields.Integer,
    'spots_count': fields.Integer,
    'created_at': fields.DateTime
}

# parking_spot_fields = {
#     'id': fields.Integer,
#     'lot_id': fields.Integer,
#     'status': fields.String
# }

# reservation_fields = {
#     'id': fields.Integer,
#     'spot_id': fields.Integer,
#     'lot_id': fields.Integer,
#     'vrn': fields.String,
#     'parking_timestamp': fields.DateTime,
#     'leaving_timestamp': fields.DateTime,
#     'duration': fields.Integer,
#     'status': fields.String,
#     'parking_cost': fields.Integer
# }

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'active': fields.String
}

class ParkingLotApi(Resource):
    def __init__(self):
        self.lot_args = reqparse.RequestParser() 
        self.lot_args.add_argument('pl_name')
        self.lot_args.add_argument('price', type=int)
        self.lot_args.add_argument('address')
        self.lot_args.add_argument('pincode', type=int)
        self.lot_args.add_argument('capacity', type=int)

    # @cache.cached(timeout=300, key_prefix='parking_lot_data')
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, lot_id=None):
        if lot_id:
            parking_lot = ParkingLot.query.get(lot_id)
            if parking_lot:
                return marshal(parking_lot, parking_lot_fields)

            return {
                "message": "Parking lot not found"
            }, 404
        parking_lots = ParkingLot.query.all()
        if parking_lots:
            return marshal(parking_lots, parking_lot_fields)
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
                "error": "Error creating parking lot"
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
                    "error": "Cannot delete the parking lot with occupied spots"
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
    # def __init__(self):
    #     self.parking_spot = reqparse.RequestParser()
    #     self.parking_spot.add_argument('status')
    
    # def get(self, spot_id=None):
    #     if spot_id:
    #         parking_spot = ParkingSpot.query.get(spot_id)
    #         if parking_spot:
    #             return marshal(parking_spot, parking_spot_fields)
    #         return {
    #             "message": "Parking spot not found"
    #         }, 404
    #     parking_spots = ParkingSpot.query.all()
    #     if parking_spots:
    #         return marshal(parking_spots, parking_spot_fields)
        
    #     return {
    #         "message": "No parking spots found"
    #     }, 404

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


    # def put(self, spot_id):
    #     args = self.parking_spot.parse_args()
    #     parking_spot = ParkingSpot.query.get(spot_id)
    #     parking_spot.status = args['status']
    #     db.session.commit()
    #     return {
    #         "message": "Parking spot updated successfully"
    #     }

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

        self.reserve_slot.add_argument('spot_id',type=int)
        self.reserve_slot.add_argument('user_id', type=int)
        self.reserve_slot.add_argument('vrn')
        self.reserve_slot.add_argument('parking_timestamp')
        self.reserve_slot.add_argument('leaving_timestamp')
        self.reserve_slot.add_argument('status')
        self.reserve_slot.add_argument('parking_cost', type=int)
    
    # @auth_required('token')
    # @roles_accepted('user', 'admin')
    # def get(self):
    #     if "admin" in roles_list(current_user.roles):
    #         reserved_spots = Reservation.query.all()
    #     else:
    #         reserved_spots = current_user.spots

    #     if reserved_spots:
    #         return marshal(reserved_spots, reservation_fields)
    #     return {
    #         "message": "No reservations found"
    #     }, 404

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
    
    # @auth_required('token')
    # @roles_accepted('admin')    
    # def put(self, reserve_id):
    #     args = self.reserve_slot.parse_args()
    #     reservation = Reservation.query.get(reserve_id)
    #     reservation.leaving_timestamp = args['leaving_timestamp']
    #     reservation.status = args['status']
    #     reservation.parking_cost = args['parking_cost']
    #     db.session.commit()
    #     return {
    #         "message": "Reservation updated successfully"
    #     }

    # @auth_required('token')
    # @roles_accepted('user')
    # def delete(self, reserve_id):
    #     reservation = Reservation.query.get(reserve_id)
    #     if reservation:
    #         db.session.delete(reservation)
    #         db.session.commit()
    #         return {
    #             "message": "Reservation deleted successfully"
    #         }
    #     else:
    #         return {
    #             "message": "Reservation not found"
    #         }, 404

class UserApi(Resource):
    def __init__(self):
        self.user = reqparse.RequestParser()
        self.user.add_argument('username')
        self.user.add_argument('email')
        self.user.add_argument('password')
        self.user.add_argument('confirm_password')

    def get(self, user_id=None):
        if user_id:
            user = User.query.get(user_id)
            if user:
                return marshal(user, user_fields)
            return {"message": "user not found"}

        users = User.query.all()        
        if users:
            return marshal(users, user_fields)
        return {
            "message": "No users found "
        }, 404

    def put(self, user_id):
        args = self.user.parse_args()
        user = User.query.get(user_id)
        username = args['username']
        email = args['email']
        password = args['password']
        confirm_password = args['confirm_password']
        print(username, email, password, confirm_password)
        if not username or not email:
            return { "error": "username or email cannot be empty"}
        
        if not password and not confirm_password:
            user.username = username
            user.email = email
            db.session.commit()
            return { "message": "profile updated successfully"}
        
        if not password or not confirm_password:
            return { "error": "please fill both password fields"}
        
        if username and email and password and confirm_password:
            if password != confirm_password:
                return { "error": "passwords do not match"}

            user.password = hash_password(password)
            user.email = email
            user.username = username
        db.session.commit()
        return {
            "message": "User updated successfully"
        }

    # def delete(self, user_id):
    #     user = User.query.get(user_id)
    #     if user:
    #         db.session.delete(user)
    #         db.session.commit()
    #         return {
    #             "message": "User deleted successfully"
    #         }
    #     else:
    #         return {
    #             "message": "User not found"
    #         }, 404
        
api.add_resource(ParkingLotApi,  '/api/parking_lot/get',
                                 '/api/parking_lot/get/<int:lot_id>',
                                 '/api/parking_lot/create',
                                 '/api/parking_lot/update/<int:lot_id>',
                                 '/api/parking_lot/delete/<int:lot_id>')
api.add_resource(ParkingSpotApi, '/api/parking_spot/create/<int:lot_id>',
                                 '/api/parking_spot/delete/<int:spot_id>')
api.add_resource(UserApi,        '/api/user/get',
                                 '/api/user/get/<int:user_id>',
                                 '/api/user/update/<int:user_id>')
api.add_resource(ReserveSpotApi, '/api/reserve_slot/<int:user_id>/create/<int:spot_id>')