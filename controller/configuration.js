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
                Detail.findOne({ is_active: true }, { _id: 0, intro_text: 1, legal_uri: 1 }, (err, detail_docs) => {
                    if (err) throw err;
                    if (!detail_docs) reject({ status: 404, error: "details not found" });
                    else Contest.find(
                        { is_active: true },
                        { _id: 0, display_name: 1, contest_id: 1, register_text: 1, "referral.is_enabled": 1 },
                        { sort: { location: 1 } },
                        (err, contest_docs) => {
                            if (err) throw err;
                            if (!contest_docs) reject({ status: 404, error: "details not found" });
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
                                        is_referral_enabled: contest.referral.is_enabled,
                                        display_name: contest.display_name,
                                        contest_id: contest.contest_id
                                    });
                                });
                                resolve(result);
                            }
                        });
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    }
}

module.exports = Configuration;