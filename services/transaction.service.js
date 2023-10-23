const { productRepo, transactionRepo, userRepo } = require('../repositories');

const {
	PaymeError,
	PaymeData,
	TransactionState,
} = require('../enums/transaction.enum');

const TransactionError = require('../errors/transaction.error');

class TransactionService {
	constructor(transactionRepo, userRepo, productRepo) {
		this.transactionRepo = transactionRepo;
		this.userRepo = userRepo;
		this.productRepo = productRepo;
	}

	async checkPerformTransaction(params, id) {
		const {
			account: { user_id: userId, product_id: productId },
		} = params;

		let { amount } = params;

		amount = Math.floor(amount / 100);

		const user = await this.userRepo.getById(userId);
		if (!user) {
			throw new TransactionError(PaymeError.UserNotFound, id, PaymeData.UserId);
		}

		const product = await this.productRepo.getById(productId);
		if (!product) {
			throw new TransactionError(
				PaymeError.ProductNotFound,
				id,
				PaymeData.ProductId,
			);
		}

		if (amount !== product.price) {
			throw new TransactionError(PaymeError.InvalidAmount, id);
		}
	}

	async checkTransaction(params, id) {
		const transaction = await this.transactionRepo.getById(params.id);
		if (!transaction) {
			throw new TransactionError(PaymeError.TransactionNotFound, id);
		}

		return {
			create_time: transaction.create_time,
			perform_time: transaction.perform_time,
			cancel_time: transaction.cancel_time,
			transaction: transaction.id,
			state: transaction.state,
			reason: transaction.reason,
		};
	}

	async createTransaction(params, id) {
		const {
			account: { user_id: userId, product_id: productId },
			time,
		} = params;

		let { amount } = params;
		amount = Math.floor(amount / 100);

		await this.checkPerformTransaction(params, id);

		let transaction = await this.transactionRepo.getById(params.id);
		if (transaction) {
			if (transaction.state !== TransactionState.Pending) {
				throw new TransactionError(PaymeError.CantDoOperation, id);
			}

			const currentTime = Date.now();

			const expirationTime =
				(currentTime - transaction.create_time) / 60000 < 12;

			if (!expirationTime) {
				await this.transactionRepo.updateById(transaction._id.toString(), {
					state: TransactionState.PendingCancel,
					reason: 4,
				});

				throw new TransactionError(PaymeError.CantDoOperation, id);
			}

			return {
				transaction: transaction.id,
				state: TransactionState.Pending,
				create_time: transaction.create_time,
			};
		}

		transaction = await this.transactionRepo.getByFilter({
			user_id: userId,
			product_id: productId,
		});

		if (transaction) {
			if (transaction.state === TransactionState.Paid) {
				throw new TransactionError(PaymeError.AlreadyDone, id);
			}

			if (transaction.state === TransactionState.Pending) {
				throw new TransactionError(PaymeError.Pending, id);
			}
		}

		const newTransaction = await this.transactionRepo.create({
			id: params.id,
			state: TransactionState.Pending,
			amount: amount,
			user_id: userId,
			product_id: productId,
			create_time: time,
		});

		return {
			transaction: newTransaction.id,
			state: TransactionState.Pending,
			create_time: newTransaction.create_time,
		};
	}

	async performTransaction(params, id) {
		const currentTime = Date.now();

		const transaction = await this.transactionRepo.getById(params.id);
		if (!transaction) {
			throw new TransactionError(PaymeError.TransactionNotFound, id);
		}

		if (transaction.state !== TransactionState.Pending) {
			if (transaction.state !== TransactionState.Paid) {
				throw new TransactionError(PaymeError.CantDoOperation, id);
			}

			return {
				state: TransactionState.Paid,
				transaction: transaction.id,
				perform_time: transaction.perform_time,
			};
		}

		const expirationTime = (currentTime - transaction.create_time) / 60000 < 12;

		if (!expirationTime) {
			await this.transactionRepo.updateById(transaction._id.toString(), {
				state: TransactionState.PaidCancel,
				reason: 4,
				cancel_time: currentTime,
			});

			throw new TransactionError(PaymeError.CantDoOperation, id);
		}

		await this.transactionRepo.updateById(transaction._id.toString(), {
			state: TransactionState.Paid,
			perform_time: currentTime,
		});

		return {
			state: TransactionState.Paid,
			transaction: transaction.id,
			perform_time: currentTime,
		};
	}

	async cancelTransaction(params, id) {
		const transaction = await this.transactionRepo.getById(params.id);
		if (!transaction) {
			throw new TransactionError(PaymeError.TransactionNotFound, id);
		}

		const currentTime = Date.now();

		if (transaction.state > 0) {
			await this.transactionRepo.updateById(transaction._id.toString(), {
				state: -Math.abs(transaction.state),
				reason: params.reason,
				cancel_time: currentTime,
			});
		}

		return {
			cancel_time: transaction.cancel_time || currentTime,
			transaction: transaction.id,
			state: -Math.abs(transaction.state),
		};
	}
}

module.exports = new TransactionService(transactionRepo, userRepo, productRepo);
