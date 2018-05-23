'use strict';

const _ = require('lodash');
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
                    referral_code: String,
                    referred_by_code: {
                        type: String,
                        default: null
                    },
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
                        type: mongoose.Schema.Types.Mixed,
                        default: {}
                    }
                }
            )
        );
    }

    getUserById(params) {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const User = mongoose.model('User');
                        User.findOne(
                            { user_id: params.user_id },
                            { _id: 0, __v: 0 },
                            (error, user_docs) => {
                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                if (error) {
                                    console.log(error);
                                    reject({ status: 400, data: { error, is_valid: false } });
                                } else {
                                    if (!user_docs) resolve({ status: 200, data: { is_valid: false } });
                                    else resolve({ status: 200, data: { is_valid: true, users: user_docs } });
                                }
                            }
                        );
                    }
                });
            } catch (error) {
                console.error(error);
                reject({ status: 400, data: { error, is_valid: false } });
            }
        });
    }

    getUsers() {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const User = mongoose.model('User');
                        User.find(
                            {},
                            { _id: 0, __v: 0 },
                            (error, user_docs) => {
                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                if (error) {
                                    console.log(error);
                                    reject({ status: 400, data: { error, is_valid: false } });
                                } else {
                                    if (!user_docs) resolve({ status: 200, data: { is_valid: false } });
                                    else resolve({ status: 200, data: { is_valid: true, users: user_docs } });
                                }
                            }
                        );
                    }
                });
            } catch (error) {
                console.error(error);
                reject({ status: 400, data: { error, is_valid: false } });
            }
        });
    }

    updateUser(params) {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        const User = mongoose.model('User');
                        User.findOne({ username: params.username }, (error, user_docs) => {
                            if (error) {
                                console.log(error);
                                reject({ status: 400, data: { error, is_valid: false } });
                            } else {
                                if (!user_docs) resolve({ data: { is_valid: false }, status: 200 });
                                else {
                                    let set_query = user_docs;
                                    let _id = user_docs._id;
                                    delete set_query._id;
                                    delete set_query.__v;
                                    if (params.hasOwnProperty('is_active')) set_query.is_active = params.is_active;
                                    if (params.hasOwnProperty('latitude') && params.latitude) set_query.current_location.latitude = parseFloat(params.latitude);
                                    if (params.hasOwnProperty('longitude') && params.longitude) set_query.current_location.longitude = parseFloat(params.longitude);
                                    if (params.hasOwnProperty('firebase_id') && params.firebase_id) set_query.firebase_id = params.firebase_id;
                                    if (params.hasOwnProperty('imei_number') && params.imei_number) set_query.imei_number.push(params.imei_number);
                                    if (params.hasOwnProperty('nodle_id') && params.nodle_id) set_query.nodle_id.push(params.nodle_id);
                                    if (params.hasOwnProperty('contest') && params.contests) Object.assign(set_query.contest, params.contests);
                                    User.update({ _id }, { $set: set_query }, (error, data) => {
                                        mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                        if (error) {
                                            console.log(error);
                                            reject({ status: 400, data: { error, is_valid: false } });
                                        } else {
                                            if (data) resolve({ status: 202, data: { is_valid: true, data: { message: "success" } } });
                                            else reject({ status: 400, data: { is_valid: false, error: "Something went wrong!!" } });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            } catch (error) {
                console.error(error);
                reject({ status: 400, data: { error, is_valid: false } });
            }
        });
    }

    createUser(params) {
        let __this = this;
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        const User = mongoose.model('User');
                        User.find({ $or: [{ email_id: params.email_id }, { username: params.username }] }, (error, user) => {
                            if (error) {
                                console.log(error);
                                reject({ status: 400, data: { error, is_valid: false } });
                            } else {
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
                                    userModel.user_id = new mongoose.Types.ObjectId();
                                    userModel.nodle_id.push(params.nodle_id);
                                    if (params.hasOwnProperty('referred_by_code') && params.referred_by_code) userModel.referred_by_code = params.referred_by_code;
                                    if (params.hasOwnProperty('contest') && params.contest) Object.assign(userModel.contest, params.contest);
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
                                            resolve({ data: { data: result, is_valid: true }, "status": 200 });
                                        } else {
                                            reject({ status: 400, data: { error: "Something went wrong!!", is_valid: false } });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            } catch (error) {
                console.log(error);
                reject({ status: 400, data: { error, is_valid: false } });
            }
        });
    }
}

module.exports = User;
