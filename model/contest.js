'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const appConfig = require('config');
const geolib = require('geolib');

class Contest {
    constructor() {
        this.ContestModel = mongoose.model(
            'Contest',
            new mongoose.Schema(
                {
                    display_name: String,
                    contest_id: {
                        type: String,
                        unique: true,
                        index: true
                    },
                    register_text: {
                        type: {
                            pre: {
                                type: String,
                                default: null
                            },
                            post: {
                                type: String,
                                default: null
                            },
                        },
                        default: {}
                    },
                    referral: {
                        type: {
                            title: {
                                type: String,
                                default: null
                            },
                            description: {
                                type: String,
                                default: null
                            },
                            share_message: {
                                type: String,
                                default: null
                            },
                            uri: {
                                type: String,
                                default: null
                            }
                        },
                        default: {}
                    },
                    referral_enabled: {
                        type: Boolean,
                        default: false
                    },
                    location: {
                        type: {
                            latitude: {
                                type: Number,
                                default: null
                            },
                            longitude: {
                                type: Number,
                                default: null
                            },
                            radius: {
                                type: Number,
                                default: null
                            }
                        },
                        default: {}
                    },
                    is_active: {
                        type: Boolean,
                        default: true
                    },
                    created: {
                        date: {
                            type: Date,
                            default: Date.now
                        },
                        by: String
                    },
                    updated: {
                        date: {
                            type: Date,
                            default: Date.now
                        },
                        by: String
                    }
                }
            )
        );
    }

    createContest(params) {
        let __this = this;
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error: error, is_valid: false } })
                    } else {
                        console.log('Mongoose connected');
                        let contestModel = new __this.ContestModel;
                        contestModel.display_name = params.display_name;
                        contestModel.contest_id = new mongoose.Types.ObjectId();
                        Object.assign(contestModel.is_active, params.is_active);
                        Object.assign(contestModel.created, { date: new Date(), by: params.user });
                        Object.assign(contestModel.updated, contestModel.created);
                        if (params.register_text) Object.assign(contestModel.register_text, params.register_text);
                        if (params.referral) {
                            Object.assign(contestModel.referral, params.referral);
                            contestModel.referral_enabled = true;
                        }
                        if (params.latitude && params.longitude && params.radius) {
                            Object.assign(contestModel.location, {
                                latitude: parseFloat(params.latitude),
                                longitude: parseFloat(params.longitude),
                                radius: parseFloat(params.radius)
                            });
                        }
                        console.log("create contest", contestModel);
                        contestModel.save().then((data) => {
                            mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                            if (data._id) resolve({ data: { data, is_valid: true }, "status": 200 });
                            else reject({ data: { error: "Unable to create", is_valid: false }, status: 400 });
                        });
                    }
                });
            } catch (error) {
                console.error(error);
                reject({ data: { error, is_valid: false }, status: 400 });
            }
        });
    }

    updateContest(params) {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const Contest = mongoose.model('Contest');
                        Contest.findOne({ contest_id: params.contest_id }, (error, contest_docs) => {
                            if (error) {
                                console.log(error);
                                reject({ status: 400, data: { error, is_valid: false } });
                            } else {
                                if (!contest_docs) resolve({ data: { is_valid: false }, status: 200 });
                                else {
                                    let set_query = contest_docs;
                                    let _id = contest_docs._id;
                                    delete set_query._id;
                                    delete set_query.__v;
                                    if (params.hasOwnProperty('is_active')) set_query.is_active = params.is_active;
                                    if (params.hasOwnProperty('display_name') && params.display_name) set_query.display_name = params.display_name;
                                    if (params.hasOwnProperty('register_text') && params.register_text) {
                                        if (params.register_text.hasOwnProperty('pre') && params.register_text.pre)
                                            set_query.register_text.pre = params.register_text.pre;
                                        if (params.register_text.hasOwnProperty('post') && params.register_text.post)
                                            set_query.register_text.post = params.register_text.post;
                                    }
                                    if (params.hasOwnProperty('referral') && params.referral) {
                                        if (params.referral.hasOwnProperty('title') && params.referral.title)
                                            set_query.referral.title = params.referral.title;
                                        if (params.referral.hasOwnProperty('description') && params.referral.description)
                                            set_query.referral.description = params.referral.description;
                                        if (params.referral.hasOwnProperty('share_message') && params.referral.share_message)
                                            set_query.referral.share_message = params.referral.share_message;
                                        if (params.referral.hasOwnProperty('uri') && params.referral.uri)
                                            set_query.referral.uri = params.referral.uri.replace(/,+$/, "");
                                        if (!set_query.referral_enabled) set_query.referral_enabled = true;
                                    }
                                    if (params.hasOwnProperty('latitude')) set_query.location.latitude = parseFloat(params.latitude);
                                    if (params.hasOwnProperty('longitude')) set_query.location.longitude = parseFloat(params.longitude);
                                    if (params.hasOwnProperty('radius')) set_query.location.radius = parseFloat(params.radius);
                                    set_query.updated = {
                                        date: new Date(),
                                        by: params.user
                                    };
                                    console.log("update contest", set_query);
                                    Contest.update({ _id }, { $set: set_query }, (error, data) => {
                                        mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                        if (error) {
                                            console.log(error);
                                            reject({ status: 400, data: { error, is_valid: false } });
                                        } else {
                                            if (data) resolve({ status: 202, data: { is_valid: true, data: { message: "Contest updation succesfull" } } });
                                            else reject({ status: 400, data: { is_valid: false, error: "Contest updation unsuccesfull" } });
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

    getContestById(params) {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const Contest = mongoose.model('Contest');
                        Contest.findOne(
                            { contest_id: params.contest_id },
                            { _id: 0, __v: 0, created: 0, updated: 0 },
                            (error, contest_docs) => {
                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                if (error) {
                                    console.log(error);
                                    reject({ status: 400, data: { error, is_valid: false } });
                                } else {
                                    if (!contest_docs) resolve({ status: 200, data: { is_valid: false } });
                                    else resolve({ status: 200, data: { is_valid: true, contests: contest_docs } });
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

    getContests() {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const Contest = mongoose.model('Contest');
                        Contest.find(
                            {},
                            { _id: 0, __v: 0, created: 0, updated: 0 },
                            (error, contest_docs) => {
                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                if (error) {
                                    console.log(error);
                                    reject({ status: 400, data: { error, is_valid: false } });
                                } else {
                                    if (!contest_docs) resolve({ status: 200, data: { is_valid: false } });
                                    else resolve({ status: 200, data: { is_valid: true, contests: contest_docs } });
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

    getActiveContestByUserCurrentLocation(params) {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const Contest = mongoose.model('Contest');
                        Contest.find(
                            { $and: [{ location: { $ne: null } }, { is_active: true }, { referral_enabled: true }] },
                            { _id: 0, contest_id: 1, register_text: 1, display_name: 1, location: 1 },
                            (error, contest_docs) => {
                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                if (error) {
                                    console.log(error);
                                    reject({ status: 400, data: { error, is_valid: false } });
                                } else {
                                    let contests = [];
                                    let is_valid = false;
                                    _.map(contest_docs, contest => {
                                        let distance = parseFloat(
                                            (
                                                geolib.getDistance(
                                                    {
                                                        latitude: params.latitude,
                                                        longitude: params.longitude
                                                    },
                                                    {
                                                        latitude: contest.location.latitude,
                                                        longitude: contest.location.longitude
                                                    }
                                                ) / 1000
                                            ).toFixed(2)
                                        );
                                        console.log(distance, contest.location.radius);
                                        if (distance <= contest.location.radius) {
                                            contests.push(contest);
                                            is_valid = true;
                                        }
                                    });
                                    resolve({ status: 200, data: { is_valid, data: contests } });
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

}

module.exports = Contest;
