'use strict';

const mongoose = require('mongoose');
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

                let User = mongoose.model('User');
                let Contest = mongoose.model('Contest');
                console.log(params);
                Contest.findOne({ contest_id: params.contest_id }, { "referral": 1 }, (err, referral) => {
                    if (err) throw err;
                    if (!referral) reject({ "status": 404, "error": "referral not found" });
                    else {
                        referral = referral.referral;
                        User.findOne({ username: params.username }, { "referral_code": 1 }, (err, referral_code) => {
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
}

module.exports = User;