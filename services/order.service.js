const BaseError = require('../errors/base.error');
const { orderRepo, productRepo, userRepo } = require('../repositories');
const base64 = require('base-64');
const environments = require('../config/environments');
const { ErrorCodes } = require('../enums/error.enum');

class OrderService {
	constructor(orderRepo, userRepo, productRepo) {
		this.orderRepo = orderRepo;
		this.productRepo = productRepo;
		this.userRepo = userRepo;
	}

	async create(data) {
		const { products, user } = data;

		const userExist = await this.userRepo.getById(user);
		if (!userExist) throw new BaseError(ErrorCodes.UserNotFound, 404);

		for (const product of products) {
			const productExist = await this.productRepo.getById(product.productId);
			if (!productExist) throw new BaseError(ErrorCodes.ProductNotFound, 404);
		}

		const newOrder = await this.orderRepo.create(data);

		return this.createPaymeUrl(newOrder);
	}

	createPaymeUrl(order) {
		const { totalPrice, _id: orderId } = order;
		const callbackUrl = 'https://example.com';
		const MERCHANT_ID = environments.MERCHANT_ID;

		const decode = base64.encode(
			`m=${MERCHANT_ID};ac.order_id=${orderId.toString()};a=${totalPrice};c=${callbackUrl}`,
		);

		return `https://checkout.paycom.uz/${decode}`;
	}
}

module.exports = new OrderService(orderRepo, userRepo, productRepo);
