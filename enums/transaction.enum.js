exports.PaymeMethod = {
	CheckPerformTransaction: 'CheckPerformTransaction',
	CheckTransaction: 'CheckTransaction',
	CreateTransaction: 'CreateTransaction',
	PerformTransaction: 'PerformTransaction',
	CancelTransaction: 'CancelTransaction',
	GetStatement: 'GetStatement',
};

exports.PaymeError = {
	InvalidAmount: {
		name: 'InvalidAmount',
		code: -31001,
		message: {
			uz: "Noto'g'ri summa",
			ru: 'Неверная сумма',
			en: 'Invalid amount',
		},
	},
	OrderNotFound: {
		name: 'OrderNotFound',
		code: -31050,
		message: {
			uz: 'Biz sizning hisobingizni topolmadik',
			ru: 'Мы не смогли найти ваш аккаунт',
			en: "We couldn't find your account",
		},
	},
	CantDoOperation: {
		name: 'CantDoOperation',
		code: -31008,
		message: {
			uz: 'Biz bu operatsiyani bajara olmaymiz',
			ru: 'Мы не можем выполнить эту операцию',
			en: 'We cannot perform this operation',
		},
	},
	TransactionNotFound: {
		name: 'TransactionNotFound',
		code: -31003,
		message: {
			uz: 'Tranzaktsiya topilmadi',
			ru: 'Транзакция не найдена',
			en: 'No transaction found',
		},
	},
	AlreadyDone: {
		name: 'AlreadyDone',
		code: -31060,
		message: {
			uz: "Mahsulot uchun to'lov qilingan",
			ru: 'Товар оплачен',
			en: 'The product has been paid for',
		},
	},
	Pending: {
		name: 'Pending',
		code: -31050,
		message: {
			uz: "Mahsulot uchun to'lov kutilyabdi",
			ru: 'Ожидается оплата товара',
			en: 'Payment for the product is pending',
		},
	},
	InvalidAuthorization: {
		name: 'InvalidAuthorization',
		code: -32504,
		message: {
			uz: 'Avtorizatsiya yaroqsiz',
			ru: 'Авторизация недействительна',
			en: 'Authorization is invalid',
		},
	},
};

exports.PaymeData = {
	OrderId: 'order_id',
};

exports.TransactionState = {
	Paid: 2,
	Pending: 1,
	PendingCancel: -1,
	PaidCancel: -2,
};
