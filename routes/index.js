const { Router } = require('express');

const router = Router();

router.use('/payments', require('./transaction.route'));
router.use('/order', require('./order.route'));

module.exports = router;
