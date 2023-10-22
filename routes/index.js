const { Router } = require('express');

const router = Router();

router.use('/payments', require('./transaction.route'));

module.exports = router;
