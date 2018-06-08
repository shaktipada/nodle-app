'use strict';

const _ = require('lodash');
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
                        default: false
                    },
                    device_conf: {
                        type: mongoose.Schema.Types.Mixed,
                        /* [{
                            type: {
                                device_type: {
                                    type: String,
                                    default: null
                                },
                                current_ver: {
                                    type: String,
                                    default: null
                                },
                                min_supported_ver: {
                                    type: String,
                                    default: null
                                }
                            },
                            default: null
                        }], */
                        default: []
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
                    if (error) {
                        console.error(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        const Detail = mongoose.model('Detail');
                        let detailModel = new __this.DetailModel;
                        detailModel.detail_id = new mongoose.Types.ObjectId();
                        detailModel.intro_text = params.intro_text;
                        detailModel.legal_uri = params.legal_uri;
                        detailModel.is_active = params.is_active;
                        if (params.hasOwnProperty('device_conf') && params.device_conf.length > 0) detailModel.device_conf = params.device_conf;
                        Object.assign(detailModel.created, {
                            date: new Date(),
                            by: params.user
                        });
                        Object.assign(detailModel.updated, detailModel.created);
                        if (detailModel.is_active) {
                            Detail.update(
                                { is_active: true },
                                { $set: { is_active: false, updated: detailModel.updated } },
                                { multi: true },
                                (error) => {
                                    if (error) {
                                        console.error(error);
                                        reject({ status: 400, data: { error, is_valid: false } });
                                    } else {
                                        console.log("create detail", detailModel);
                                        detailModel.save().then((data) => {
                                            mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                            if (data._id) resolve({ "data": { data, is_valid: true }, "status": 200 });
                                            else reject({ status: 400, data: { error: "Unable to create", is_valid: false } });
                                        });
                                    }
                                }
                            );
                        } else {
                            console.log("create detail", detailModel);
                            detailModel.save().then((data) => {
                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                if (data._id) resolve({ "data": { data, is_valid: true }, "status": 200 });
                                else reject({ status: 400, data: { error: "Unable to create", is_valid: false } });
                            });
                        }
                    }
                });
            } catch (error) {
                console.error(error);
                reject({ status: 400, data: { error, is_valid: false } });
            }
        });
    }

    updateDetail(params) {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.error(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const Detail = mongoose.model('Detail');
                        Detail.findOne({ detail_id: params.detail_id }, (error, detail_docs) => {
                            if (error) {
                                console.log(error);
                                reject({ status: 400, data: { error, is_valid: false } });
                            } else {
                                if (!detail_docs) resolve({ data: { is_valid: false }, status: 200 });
                                else {
                                    let set_query = detail_docs;
                                    let _id = detail_docs._id;
                                    delete set_query._id;
                                    delete set_query.__v;
                                    set_query.updated = { date: new Date(), by: params.user };
                                    if (params.hasOwnProperty('intro_text')) set_query.intro_text = params.intro_text;
                                    if (params.hasOwnProperty('legal_uri')) set_query.legal_uri = params.legal_uri;
                                    if (params.hasOwnProperty('is_active')) set_query.is_active = params.is_active;
                                    if (params.hasOwnProperty('device_conf') && params.device_conf.length > 0) detailModel.device_conf = params.device_conf;
                                    if (set_query.is_active)
                                        Detail.update(
                                            { is_active: true },
                                            { $set: { is_active: false, updated: { date: new Date(), by: params.user } } },
                                            { multi: true }, (error) => {
                                                Detail.update(
                                                    { _id },
                                                    { $set: set_query },
                                                    (error, detail_docs) => {
                                                        mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                                        if (error) {
                                                            console.error(error);
                                                            reject({ status: 400, data: { error, is_valid: false } });
                                                        } else {
                                                            if (detail_docs) resolve({ status: 200, data: { is_valid: true, message: "Details saved succesfully" } });
                                                            else reject({ status: 400, data: { is_valid: false, message: "Details not saved" } });
                                                        }
                                                    }
                                                );
                                            }
                                        );
                                    else
                                        Detail.update(
                                            { _id },
                                            { $set: set_query },
                                            (error, detail_docs) => {
                                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                                if (error) {
                                                    console.error(error);
                                                    reject({ status: 400, data: { error, is_valid: false } });
                                                } else {
                                                    if (detail_docs) resolve({ status: 200, data: { is_valid: true, message: "Details saved succesfully" } });
                                                    else reject({ status: 400, data: { is_valid: false, message: "Details not saved" } });
                                                }
                                            }
                                        );
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

    getDetailById(params) {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.error(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const Detail = mongoose.model('Detail');
                        Detail.findOne(
                            { detail_id: params.detail_id },
                            { _id: 0, __v: 0, created: 0 },
                            (error, detail_docs) => {
                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                if (error) {
                                    console.error(error);
                                    reject({ status: 400, data: { error, is_valid: false } });
                                } else {
                                    if (detail_docs) resolve({ status: 200, data: { is_valid: true, details: detail_docs } });
                                    else reject({ status: 400, data: { is_valid: false } });
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

    getDetails() {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connect(appConfig.mongo.host, function (error) {
                    if (error) {
                        console.error(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        console.log('Mongoose connected');
                        const Detail = mongoose.model('Detail');
                        Detail.find(
                            {},
                            { _id: 0, __v: 0, created: 0 },
                            (error, detail_docs) => {
                                mongoose.connection.close(() => { console.log('Mongoose disconnected'); });
                                if (error) {
                                    console.error(error);
                                    reject({ status: 400, data: { error, is_valid: false } });
                                } else {
                                    if (detail_docs) resolve({ status: 200, data: { is_valid: true, details: detail_docs } });
                                    else reject({ status: 400, data: { is_valid: false } });
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

module.exports = Detail