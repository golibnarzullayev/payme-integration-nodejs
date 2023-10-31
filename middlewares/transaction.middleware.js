const base64 = require('base-64');

const { PaymeError } = require('../enums/transaction.enum');
const { PAYME_CHECKOUT_KEY } = require('../config/environments');

const TransactionError = require('../errors/transaction.error');

exports.paymeCheckToken = (req, res, next) => {
	const { id } = req.body;
	const authorization = req.headers.authorization;
	const token = authorization && authorization.split(' ')[1];

	if (!token) throw new TransactionError(PaymeError.InvalidAuthorization, id);

	const data = base64.decode(token);
	if (!data.includes(PAYME_CHECKOUT_KEY))
		throw new TransactionError(PaymeError.InvalidAuthorization, id);

	next();
};
