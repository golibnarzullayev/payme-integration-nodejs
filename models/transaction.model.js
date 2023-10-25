const { Schema, model } = require('mongoose');
const { TransactionState } = require('../enums/transaction.enum');

const transactionSchema = new Schema(
	{
		id: {
			type: String,
			required: true,
		},
		order_id: {
			type: String,
			required: true,
		},
		state: {
			type: Number,
			enum: Object.values(TransactionState),
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		create_time: {
			type: Number,
			default: Date.now(),
		},
		perform_time: {
			type: Number,
			default: 0,
		},
		cancel_time: {
			type: Number,
			default: 0,
		},
		reason: {
			type: Number,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = model('transaction', transactionSchema);
