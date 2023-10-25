const { Schema, model } = require('mongoose');
const { OrderStatus } = require('../enums/order.enum');

const orderSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'user',
		},
		products: {
			type: [
				{
					productId: {
						type: String,
						required: true,
					},
					count: {
						type: Number,
						required: true,
					},
				},
			],
			required: true,
		},
		totalPrice: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: Object.values(OrderStatus),
			default: OrderStatus.Pending,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = model('order', orderSchema);
