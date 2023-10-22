const { Schema, model } = require('mongoose');

const productSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = model('product', productSchema);
