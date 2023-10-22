const { Router } = require('express');

const transactionController = require('../controllers/transaction.controller');
const { paymeCheckToken } = require('../middlewares/transaction.middleware');

const router = Router();

router.post('/payme', paymeCheckToken, transactionController.payme);

module.exports = router;
