from flask_restful import Resource, Api, reqparse, fields, marshal 
from flask_security import auth_required, current_user, roles_required, roles_accepted, hash_password
import datetime

from .models import *
from .utils import roles_list, get_reserved_spots_count
from cache import *

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

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'active': fields.String
}


@cache.memoize(timeout=300)
def get_parking_lot_data(lot_id=None):
    if lot_id:
        lot = ParkingLot.query.get(lot_id)
        if lot:
            return marshal(lot, parking_lot_fields)
        return None
    else:
        lots = ParkingLot.query.all()
        if lots:
            return marshal(lots, parking_lot_fields)
        return None

@cache.memoize(timeout=300)
def get_user_data(user_id=None):
    if user_id:
        user = User.query.get(user_id)
        return marshal(user, user_fields) if user else None
    users = User.query.all()
    return marshal(users, user_fields) if users else None


class ParkingLotApi(Resource):
    def __init__(self):
        self.lot_args = reqparse.RequestParser() 
        self.lot_args.add_argument('pl_name')
        self.lot_args.add_argument('price', type=int)
        self.lot_args.add_argument('address')
        self.lot_args.add_argument('pincode', type=int)
        self.lot_args.add_argument('capacity', type=int)

    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, lot_id=None):
        data = get_parking_lot_data(lot_id)
        if data is None:
            return {"error": "Parking lot not found" if lot_id else "No parking lots found"}, 404
        return data, 200

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
            db.session.flush() 

            for i in range(int(args['capacity'])):
                spot = ParkingSpot(lot_id=parking_lot.id)
                db.session.add(spot)
            db.session.commit()
            cache.delete_memoized(get_parking_lot_data)
            return {
                "message": "Parking lot created successfully"
            }, 201
        except:
            return {
                "error": "Error creating parking lot"
            }, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, lot_id):
        args = self.lot_args.parse_args()
        try:
            parking_lot = ParkingLot.query.get(lot_id)
            parking_lot.pl_name = args['pl_name']
            parking_lot.price = args['price']
            parking_lot.address = args['address']
            parking_lot.pincode = args['pincode']
            db.session.commit()
            cache.delete_memoized(get_parking_lot_data)
            cache.delete_memoized(get_parking_lot_data, lot_id)
            return {
                "message": "Parking lot updated successfully"
            }, 200
        except:
            return {
                "error": "Error updating parking lot"
            }, 400

    @auth_required('token')
    @roles_required('admin')
    def delete(self, lot_id):
        parking_lot = ParkingLot.query.get(lot_id)

        if parking_lot:
            occupied_spots = get_reserved_spots_count(lot_id)
            if occupied_spots > 0:
                return {
                    "error": "Cannot delete the parking lot with occupied spots"
                }, 409
            db.session.delete(parking_lot)
            db.session.commit() 
            cache.delete_memoized(get_parking_lot_data)
            cache.delete_memoized(get_parking_lot_data, lot_id)
            return {
                'message': 'parking lot deleted successfully'
            }, 200          
        else:
            return {
                "error": "Parking lot not found"
            }, 404


class ParkingSpotApi(Resource):
    @auth_required('token')
    @roles_required('admin')
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
                'error': 'parking lot is full'
            }, 409

    @auth_required('token')
    @roles_required('admin')
    def delete(self, spot_id):
        parking_spot = ParkingSpot.query.get(spot_id)
        if parking_spot:
            db.session.delete(parking_spot)
            spot_lot = ParkingLot.query.get(parking_spot.lot_id)
            spot_lot.spots_count -= 1
            db.session.commit()
            return {
                "message": "Parking spot deleted successfully"
            }, 200
        else:
            return {
                "error": "Parking spot not found"
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

    @auth_required('token')
    @roles_accepted('admin', 'user')
    def post(self, user_id, spot_id):
        args = self.reserve_slot.parse_args()
        try:
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
            }, 201
        except :
            return {
                "error": "Error creating reservation"
            }, 400
    


class UserApi(Resource):
    def __init__(self):
        self.user = reqparse.RequestParser()
        self.user.add_argument('username')
        self.user.add_argument('email')
        self.user.add_argument('password')
        self.user.add_argument('confirm_password')

    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, user_id=None):
        data = get_user_data(user_id)
        if not data:
            return {"error": "user not found" if user_id else "No users found"}, 404
        return data, 200

    @auth_required('token')
    @roles_accepted('admin', 'user')
    def put(self, user_id):
        args = self.user.parse_args()
        try:
            user = User.query.get(user_id)
            username = args['username']
            email = args['email']
            password = args['password']
            confirm_password = args['confirm_password']
            if not username or not email:
                return { "error": "username or email cannot be empty"}, 400
            
            if not password and not confirm_password:
                user.username = username
                user.email = email
                db.session.commit()
                return { "message": "profile updated successfully"}, 200
            
            if not password or not confirm_password:
                return { "error": "please fill both password fields"}, 400
            
            if username and email and password and confirm_password:
                if password != confirm_password:
                    return { "error": "passwords do not match"}, 400

                user.password = hash_password(password)
                user.email = email
                user.username = username
            db.session.commit()
            cache.delete_memoized(get_user_data)
            cache.delete_memoized(get_user_data, user_id)
            return {
                "message": "User updated successfully"
            }, 200
        except:
            return {
                "error": "Error updating user profile"
            }, 400
        
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