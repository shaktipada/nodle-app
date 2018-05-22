const router = require('express').Router();

const __detail = new (require('./controller/detail'))();
const __contest = new (require('./controller/contest'))();
const __user = new (require('./controller/user'))();
const __configuration = new (require('./controller/configuration'))();


router.get('/configuration', (request, response, next) => {
    __configuration.getConfiguration(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});


router.post('/detail/create', (request, response, next) => {
    __detail.createDetail(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});
router.put('/detail/update', (request, response, next) => {
    __detail.updateDetail(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});
router.get('/detail/id', (request, response, next) => {
    __detail.getDetailById(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});
router.get('/detail', (request, response, next) => {
    __detail.getDetails(request, response, next).then((result) => {
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
router.put('/contest/update', (request, response, next) => {
    __contest.updateContest(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});
router.get('/contest/user-current-location', (request, response, next) => {
    __contest.getActiveContestByUserCurrentLocation(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});
router.get('/contest/id', (request, response, next) => {
    __contest.getContestById(request, response, next).then((result) => {
        return response.send(result);
    }).catch((error) => {
        return response.send(error);
    });
});
router.get('/contest', (request, response, next) => {
    __contest.getContests(request, response, next).then((result) => {
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

module.exports = router;