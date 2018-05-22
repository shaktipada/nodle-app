'use strict';

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
                if (!params.is_active) reject({ "status": 404, "error": "is active not found" });

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