const { transactionModel } = require('../models');

class TransactionRepo {
	constructor(model) {
		this.model = model;
	}

	async create(data) {
		return this.model.create(data);
	}

	async getById(transactionId) {
		return this.model.findOne({ id: transactionId });
	}

	async getByFilter(filter) {
		return this.model.findOne(filter);
	}

	async updateById(id, update) {
		return this.model.findByIdAndUpdate(id, update);
	}

	async getByDateFilter(from, to) {
		return this.model.find({ create_time: { $gte: from, $lte: to } });
	}
}

module.exports = new TransactionRepo(transactionModel);
