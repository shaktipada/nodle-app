'use strict';

const Promise = require('bluebird');

const __detail = new (require('../model/detail'))();

class Detail {
    createDetail(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                let params = request.body;
                console.log(params);
                if (!params.user) reject({ "status": 404, "error": "user not found" });
                if (!params.intro_text) reject({ "status": 404, "error": "display name not found" });
                if (!params.legal_uri) reject({ "status": 404, "error": "register texts not found" });
                if (!params.is_active) reject({ "status": 404, "error": "is active not found" });

                __detail.createDetail(params).then((result) => {
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

module.exports = Detail;