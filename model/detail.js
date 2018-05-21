'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const appConfig = require('config');

class Detail {
    constructor() {
        this.DetailModel = mongoose.model(
            'Detail',
            new mongoose.Schema(
                {
                    detail_id: String,
                    intro_text: String,
                    legal_uri: String,
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

    createDetail(params) {
        let __this = this;
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) throw error;
                    __this.DetailModel.update({ is_active: true }, { $set: { is_active: false } }, { multi: true }, (error) => { 
                        if (error) throw error;
                        let detailModel = new __this.DetailModel;
                        detailModel.detail_id = new mongoose.Types.ObjectId();
                        detailModel.intro_text = params.intro_text;
                        detailModel.legal_uri = params.legal_uri;
                        Object.assign(detailModel.is_active, params.is_active);
                        Object.assign(detailModel.created, {
                            date: new Date(),
                            by: params.user
                        });
                        Object.assign(detailModel.updated, detailModel.created);
                        console.log("create detail", detailModel);
                        detailModel.save().then((data) => {
                            if (data._id) resolve({ "data": data, "status": 200 });
                            else reject({ "error": "Unable to create", "status": 400 });
                        });
                    });
                });
            } catch (error) {
                console.error(error);
                reject({ "error": error, status: 400 });
            }
        });
    }

}

module.exports = Detail