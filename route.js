const router = require('express').Router();

const __detail = new (require('./controller/detail'))();
const __contest = new (require('./controller/contest'))();
const __user = new (require('./controller/user'))();
const __configuration = new (require('./controller/configuration'))();

router.post('/detail/create', (request, response, next) => {
    __detail.createDetail(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});

router.post('/contest/create', (request, response, next) => {
    __contest.createContest(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});

router.post('/user/register', (request, response, next) => {
    __user.createUser(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});

router.get('/user/referral', (request, response, next) => {
    __user.getReferral(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});

router.get('/configuration', (request, response, next) => {
    __configuration.getConfiguration(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});
module.exports = router;