const orderService = require('../services/order.service');

class OrderController {
	constructor() {}

	async create(req, res, next) {
		try {
			const data = req.body;

			const url = await orderService.create(data);

			res.status(201).json({
				message: 'ORDER_CREATED',
				data: {
					url: url,
				},
			});
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new OrderController();
