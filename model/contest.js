'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const appConfig = require('config');

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
                        pre: String,
                        post: String,
                    },
                    referral: {
                        title: String,
                        description: String,
                        share_message: String,
                        uri: String,
                        is_enabled: {
                            type: Boolean,
                            default: true
                        }
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
                    if (error) throw error;
                    let contestModel = new __this.ContestModel;
                    contestModel.display_name = params.display_name;
                    contestModel.contest_id = new mongoose.Types.ObjectId();
                    Object.assign(contestModel.register_text, params.register_text);
                    Object.assign(contestModel.is_active, params.is_active);
                    Object.assign(contestModel.referral, params.referral);
                    Object.assign(contestModel.created, {
                        date: new Date(),
                        by: params.user
                    });
                    Object.assign(contestModel.updated, contestModel.created);
                    if (params.latitude && params.longitude && params.radius) {
                        Object.assign(contestModel.location, {
                            latitude: params.latitude,
                            longitude: params.longitude,
                            radius: params.radius
                        });
                    }
                    console.log("create contest", contestModel);
                    contestModel.save().then((data) => {
                        if (data._id) resolve({ "data": data, "status": 200 });
                        else reject({ "error": "Unable to create", "status": 400 });
                    });
                });
            } catch (error) {
                console.error(error);
                reject({ "error": error, status: 400 });
            }
        });
    }
}

module.exports = Contest;
