const Router = require('express');

const expiries = require('../routes/expiries.route');
const premiums = require('../routes/premiums.route');

const router = Router();

router.use('/expiries', expiries);
router.use('/premiums', premiums);

module.exports = router;