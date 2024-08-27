const Router = require('express');
const { getAllExpiries } = require('../controllers/expiries.controller');

const router = Router();

router.route('/all').get(getAllExpiries);

module.exports = router;