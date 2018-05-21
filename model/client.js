'use strict';

const randomstring = require('randomstring');
const mongoose = require('mongoose');
const schema = mongoose.Schema;

module.exports = mongoose.model('Client', new schema({
    id: {
        type: String,
        unique: true,
        index: true,
        default: () => {
            return randomstring.generate(6)
        }
    },
    name: {
        type: String,
        unique: true,
    },
    secret: {
        type: String,
        default: () => {
            return randomstring.generate(12)
        }
    },
    redirect_uri: String
}));