const dotenv = require('dotenv');

dotenv.config();

module.exports = {
	PORT: process.env.PORT,
	MONGO_URI: process.env.MONGO_URI,
	PAYME_CHECKOUT_KEY: process.env.PAYME_CHECKOUT_KEY,
	MERCHANT_ID: process.env.MERCHANT_ID,
};
