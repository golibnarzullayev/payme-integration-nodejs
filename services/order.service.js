const environments = require('../config/environments');
const BaseError = require('../errors/base.error');
const { orderRepo, productRepo, userRepo } = require('../repositories');
const base64 = require('base-64');

class OrderService {
	constructor(orderRepo, userRepo, productRepo) {
		this.orderRepo = orderRepo;
		this.productRepo = productRepo;
		this.userRepo = userRepo;
	}

	async create(data) {
		const { products, user } = data;

		const userExist = await this.userRepo.getById(user);
		if (!userExist) throw new BaseError('USER_NOT_FOUND', 404);

		for (const product of products) {
			const productExist = await this.productRepo.getById(product.productId);
			if (!productExist) throw new BaseError('PRODUCT_NOT_FOUND', 404);
		}

		const newOrder = await this.orderRepo.create(data);

		return this.createPaymeUrl(newOrder);
	}

	createPaymeUrl(order) {
		const MERCHANT_ID = environments.MERCHANT_ID;
		const callbackUrl = 'https://example.com';

		const decode = base64.encode(
			`m=${MERCHANT_ID};ac.order_id=${order._id.toString()};a=${order.totalPrice};c=${callbackUrl}`,
		);

		return `https://checkout.paycom.uz/${decode}`;
	}
}

module.exports = new OrderService(orderRepo, userRepo, productRepo);
