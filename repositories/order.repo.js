const { orderModel } = require('../models');

class OrderRepo {
	constructor(model) {
		this.model = model;
	}
	async create(data) {
		return this.model.create(data);
	}

	async getById(orderId) {
		return this.model.findById(orderId);
	}

	async updateById(orderId, updatedData) {
		return this.model.findByIdAndUpdate(orderId, updatedData);
	}
}

module.exports = new OrderRepo(orderModel);
