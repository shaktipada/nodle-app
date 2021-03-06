'use strict';

const Promise = require('bluebird');

const __contest = new (require('../model/contest'))();

class Contest {
    createContest(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.body;
                if (!params.user) reject({ "status": 404, "error": "user not found" });
                if (!params.display_name) reject({ "status": 404, "error": "display name not found" });
                if (!params.is_active) reject({ "status": 404, "error": "is active not found" });
                if (params.register_text) {
                    if (!params.register_text.pre) reject({ "status": 404, "error": "pre register texts not found" });
                    if (!params.register_text.post) reject({ "status": 404, "error": "post register texts not found" });
                }
                if (params.referral) {
                    if (!params.referral.title) reject({ "status": 404, "error": "referral title not found" });
                    if (!params.referral.description) reject({ "status": 404, "error": "referral description not found" });
                    if (!params.referral.share_message) reject({ "status": 404, "error": "referral share message not found" });
                    if (!params.referral.uri) reject({ "status": 404, "error": "referral uri not found" });
                    else params.referral.uri = params.referral.uri.replace(/,+$/, "");
                }

                if ((!params.latitude || !params.longitude) && params.radius) reject({ "status": 404, "error": "latitude & longitude not found" });
                if ((params.latitude && params.longitude) && !params.radius) reject({ "status": 404, "error": "radius not found" });
                if ((params.latitude && params.radius) && !params.longitude) reject({ "status": 404, "error": "longitude not found" });
                if ((params.radius && params.longitude) && !params.latitude) reject({ "status": 404, "error": "latitude not found" });

                __contest.createContest(params).then((result) => {
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

    updateContest(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.body;
                if (!params.user) reject({ "status": 404, "error": "user not found" });
                if (!params.contest_id) reject({ "status": 404, "error": "contest id not found" });
                __contest.updateContest(params).then((result) => {
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

    getContestById(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.query;
                if (!params.contest_id) reject({ "status": 404, "error": "contest id not found" });
                __contest.getContestById(params).then((result) => {
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

    getContests(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                __contest.getContests().then((result) => {
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

    getActiveContestByUserCurrentLocation(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.query;
                if (!params.lat || !params.long) reject({ "status": 404, "error": "latitude & longitude not found" });
                else {
                    params = {
                        latitude: params.lat,
                        longitude: params.long
                    };
                    __contest.getActiveContestByUserCurrentLocation(params).then((result) => {
                        resolve(result);
                    }).catch((error) => {
                        console.log("controller:error", error);
                        reject(error);
                    });
                }
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }
}

module.exports = Contest;