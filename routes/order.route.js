const { Router } = require('express');

const orderController = require('../controllers/order.controller');

const router = Router();

router.post('/create', orderController.create);

module.exports = router;
