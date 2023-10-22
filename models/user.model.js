const { Schema, model } = require('mongoose');

const userSchema = new Schema(
	{
		name: {
			type: String,
			trim: true,
			required: true,
		},
		phone: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = model('user', userSchema);
