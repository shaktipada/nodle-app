'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const appConfig = require('config');
const Promise = require('bluebird');

const __user = new (require('../model/user'))();

class User {
    createUser(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.body;
                if (!params.latitude || !params.longitude) reject({ "status": 404, "error": "latitude longitude not found" });
                if (!params.username) reject({ "status": 404, "error": "username not found" });
                if (!params.nodle_id) reject({ "status": 404, "error": "nodle id not found" });
                if (!params.email_id) reject({ "status": 404, "error": "email id not found" });
                else if (!/^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(params.email_id))
                    reject({ "error": "This email address is invalid", "status": 400 });
                if (!params.imei_number) reject({ "status": 404, "error": "IMEI number not found" });
                else if (!/^[0-9]/.test(params.imei_number))
                    reject({ "error": "This IMEI number is invalid", "status": 400 });
                __user.createUser(params).then((result) => {
                    console.log("controller", result);
                    resolve(result);
                }).catch((error) => {
                    console.log("controller:error", error);
                    reject(error);
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    getReferral(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = {};
                if (!request.headers.username) reject({ "status": 404, "error": "username not found" });
                else params['username'] = request.headers.username;
                if (!request.query.contest_id) reject({ "status": 404, "error": "contest id not found" });
                else params['contest_id'] = request.query.contest_id;

                const User = mongoose.model('User');
                const Contest = mongoose.model('Contest');
                console.log(params);
                Contest.findOne({ contest_id: params.contest_id, referral_enabled: true }, { referral: 1 }, (err, referral) => {
                    if (err) throw err;
                    if (!referral) reject({ "status": 404, "error": "referral not found" });
                    else {
                        referral = referral.referral;
                        User.findOne({ username: params.username }, { referral_code: 1 }, (err, referral_code) => {
                            if (err) throw err;
                            if (!referral) reject({ "status": 404, "error": "referral code not found" });
                            else {
                                referral_code = referral_code.referral_code;
                                resolve({
                                    description: `<h3>${referral.title}</h3><p>${referral.description}</p>`,
                                    share_message: referral.share_message,
                                    uri: `${referral.uri}/${referral_code.referral_code}`
                                });
                            }
                        });
                    }
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    getUserById(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.query;
                if (!params.user_id) reject({ "status": 404, "error": "contest id not found" });
                __user.getUserById(params).then((result) => {
                    resolve(result);
                }).catch((error) => {
                    console.log("controller:error", error);
                    reject(error);
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    getUsers(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                __user.getUsers().then((result) => {
                    resolve(result);
                }).catch((error) => {
                    console.log("controller:error", error);
                    reject(error);
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }

    getLeaderboard(request, response, next) {
        return new Promise((resolve, reject) => {
            try {

                let contest_id = null;
                if (!request.query.hasOwnProperty('contest_id') || !request.query.contest_id)
                    reject({ status: 404, data: { error: "contest id not found", is_valid: false } });
                else
                    contest_id = request.query.contest_id;

                let username = null;
                if (!request.query.hasOwnProperty('username') || !request.query.username)
                    reject({ status: 404, data: { error: "username not found", is_valid: false } });
                else
                    username = request.query.username;

                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.log(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        const User = mongoose.model('User');
                        const Contest = mongoose.model('Contest');
                        Contest.findOne({ contest_id: contest_id, referral_enabled: true }, (error, contest_docs) => {
                            if (error) {
                                console.log(error);
                                reject({ status: 400, data: { error, is_valid: false } });
                            } else {
                                if (!contest_docs) {
                                    User.find(
                                        { is_active: true },
                                        { _id: 0, username: 1, contest: 1 },
                                        (error, user_docs) => {
                                            if (error) {
                                                console.log(error);
                                                reject({ status: 400, data: { error, is_valid: false } });
                                            } else {
                                                if (!user_docs) user_docs = { "leaderboard": [] };
                                                else {
                                                    let leaderboard = []
                                                    let user_data = {};
                                                    _.map(user_docs, user => {
                                                        let data = {
                                                            username: user.username,
                                                            nodle_count: Object.values(user.contest).reduce((acc, val) => { return acc + val; })
                                                        };
                                                        leaderboard.push(data);
                                                        if (username === user.username) Object.assign(user_data, data);
                                                    });
                                                    leaderboard = _.orderBy(leaderboard, ['nodle_count'], ['desc']);
                                                        resolve({
                                                        status: 200,
                                                        data: {
                                                            is_valid: true,
                                                            user: user_data,
                                                            leaderboard: leaderboard
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    );
                                } else {
                                    console.log("need to impement")
                                }
                            }
                        });
                    }
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }
}

module.exports = User;