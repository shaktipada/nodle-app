'use strict';

const _ = require('lodash');
const geolib = require('geolib');
const Promise = require('bluebird');
const randomstring = require('randomstring');
const mongoose = require('mongoose');
const appConfig = require('config');


class User {
    constructor() {
        this.UserModel = mongoose.model(
            'User',
            new mongoose.Schema(
                {
                    email_id: {
                        type: String,
                        lowercase: true,
                    },
                    username: {
                        type: String,
                        index: true,
                    },
                    user_id: String,
                    password: String,
                    registered_location: {
                        type: {
                            latitude: Number,
                            longitude: Number,
                        }
                    },
                    current_location: {
                        type: {
                            latitude: Number,
                            longitude: Number,
                        }
                    },
                    is_active: {
                        type: Boolean,
                        default: true
                    },
                    firebase_id: String,
                    imei_number: [Number],
                    nodle_id: [String],
                    contest: {
                        type: [{
                            count: {
                                type: Number,
                                default: null
                            },
                            contest_id: {
                                type: String,
                                default: null
                            },
                            _id: false
                        }],
                        default: null
                    },
                    referral_code: String,
                    referred_by_code: {
                        type: String,
                        default: null
                    }
                }
            )
        );
    }

    getContestByUserCurrentLocation(user_current_location) {
        return new Promise((resolve, reject)=>{
            try {
                const Contest = mongoose.model('Contest');
                Contest.find(
                    { $and: [{ location: { $ne: null } }, { is_active: true }] },
                    { location: 1, contest_id: 1 },
                    (err, contests) => {
                        if (err) throw err;
                        if (contests.length < 0) reject("");
                        else {
                            _.map(contests, contest => {
                                let distance = parseFloat(
                                    (
                                        geolib.getDistance(
                                            {
                                                latitude: user_current_location.latitude,
                                                longitude: user_current_location.longitude
                                            },
                                            {
                                                latitude: contest.location.latitude,
                                                longitude: contest.location.longitude
                                            }
                                        ) / 1000
                                    ).toFixed(2)
                                );
                                if (distance <= contest.location.radius) resolve(contest.contest_id);
                            });
                        }
                    });
            } catch (error) {
                console.error(error);
                reject({ "error": error, status: 400 });
            }
        });
    }

    createUser(params) {
        let __this = this;
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) throw error;
                    __this.UserModel.find({ $or: [{ email_id: params.email_id }, { username: params.username }] }, (err, user) => {
                        if (error) throw error;
                        if (user.length > 0) reject({ "error": "This email address/username already exists", "status": 400 });
                        else {
                            let userModel = new __this.UserModel;
                            userModel.email_id = params.email_id;
                            userModel.username = params.username;
                            userModel.password = randomstring.generate(8);
                            userModel.is_active = true;
                            userModel.registered_location = {
                                latitude: parseFloat(params.latitude),
                                longitude: parseFloat(params.longitude)
                            };
                            userModel.current_location = userModel.registered_location;
                            userModel.firebase_id = params.firebase_id;
                            userModel.imei_number.push(parseInt(params.imei_number));
                            userModel.referral_code = new mongoose.Types.ObjectId();
                            if (params.hasOwnProperty('referred_by_code') && params.referred_by_code) userModel.referred_by_code = params.referred_by_code;
                            userModel.user_id = new mongoose.Types.ObjectId();
                            userModel.nodle_id.push(params.nodle_id);
                            __this.getContestByUserCurrentLocation(userModel.current_location).then((contest_id) => {
                                console.log(contest_id);
                                if (contest_id != "")
                                    userModel.contest.push({
                                        contest_id: contest_id,
                                        count: ((params.hasOwnProperty('nodle_count') && params.nodle_count) ? parseInt(params.nodle_count) : 0)
                                    });
                                console.log("create user", userModel);
                                userModel.save().then((data) => {
                                    if (data._id) {
                                        console.log("user created succesfully", data);
                                        let result = {
                                            'imei_number': params.imei_number,
                                            'nodle_id': params.nodle_id,
                                            'contest': data.contest,
                                            'is_active': data.is_active,
                                            'email_id': data.email_id,
                                            'username': data.username,
                                            'password': data.password,
                                            'firebase_id': data.firebase_id,
                                            'referral_code': data.referral_code,
                                            'user_id': data.user_id,
                                            'registered_location': data.registered_location,
                                            'current_location': data.current_location
                                        };
                                        resolve({ "data": result, "status": 200 });
                                    } else {
                                        reject({ "error": "Unable to register", "status": 400 });
                                    }
                                });
                            }).catch((error) => {
                                reject(error);
                            });

                        }
                    });
                });
            } catch (error) {
                console.error(error);
                reject({ "error": error, status: 400 });
            }
        });
    }
}

module.exports = User;
