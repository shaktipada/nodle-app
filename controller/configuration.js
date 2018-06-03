'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const mongoose = require('mongoose');

class Configuration {
    getConfiguration(request, response, next) {
        return new Promise((resolve, reject) => {
            try {
                //let params = request.query;
                const Detail = mongoose.model('Detail');
                const Contest = mongoose.model('Contest');
                Detail.findOne({ is_active: true }, { _id: 0, intro_text: 1, legal_uri: 1 }, (error, detail_docs) => {
                    if (error) {
                        console.error(error);
                        reject({ status: 400, data: { error, is_valid: false } });
                    } else {
                        if (!detail_docs) resolve({ status: 200, data: { is_valid: false } });
                        else Contest.find(
                            { is_active: true },
                            { _id: 0, display_name: 1, contest_id: 1, register_text: 1, referral_enabled: 1 },
                            { sort: { location: 1 } },
                            (error, contest_docs) => {
                                if (error) {
                                    console.error(error);
                                    reject({ status: 400, data: { error, is_valid: false } });
                                } else {
                                    if (!contest_docs) resolve({ status: 200, data: { is_valid: false } });
                                    else {
                                        let result = {
                                            intro_text: detail_docs.intro_text,
                                            legal_uri: detail_docs.legal_uri,
                                            contest: []
                                        };
                                        _.map(contest_docs, contest => {
                                            result.contest.push({
                                                register_text_pre: contest.register_text.pre,
                                                register_text_post: contest.register_text.post,
                                                is_referral_enabled: contest.referral_enabled,
                                                display_name: contest.display_name,
                                                contest_id: contest.contest_id
                                            });
                                        });
                                        resolve({ status: 200, data: { is_valid: true, details: result } });
                                    }
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

module.exports = Configuration;