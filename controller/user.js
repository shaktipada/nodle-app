'use strict';

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
}

module.exports = User;