'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const __detail = new (require('../model/detail'))();

class Detail {
    createDetail(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.body;
                if (!params.user) reject({ "status": 404, "error": "user not found" });
                if (!params.intro_text) reject({ "status": 404, "error": "display name not found" });
                if (!params.legal_uri) reject({ "status": 404, "error": "register texts not found" });
                if (!params.hasOwnProperty("is_active")) reject({ "status": 404, "error": "is active not found" });

                if (params.device_conf && params.device_conf.length > 0) {
                    _.map(params.device_conf, device => {
                        if (!device.device_type)
                            reject({ "status": 404, "error": "device type not found" });
                        if (!device.current_ver)
                            reject({ "status": 404, "error": "current version not found" });
                        if (!device.min_supported_ver)
                            reject({ "status": 404, "error": "supported version not found" });
                    });
                }
                __detail.createDetail(params).then((result) => {
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

    updateDetail(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.body;
                if (!params.user) reject({ "status": 404, "error": "user not found" });
                if (!params.detail_id) reject({ "status": 404, "error": "detail id not found" });
                __detail.updateDetail(params).then((result) => {
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

    getDetails(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                __detail.getDetails().then((result) => {
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

    getDetailById(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.query;
                if (!params.detail_id) reject({ "status": 404, "error": "detail id not found" });

                __detail.getDetailById(params).then((result) => {
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

module.exports = Detail;