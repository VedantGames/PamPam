const Router = require('express');
const { getPremiums } = require('../controllers/premiums.controller');

const router = Router();

router.route('/:symbol/:expiry').get(getPremiums);

module.exports = router;