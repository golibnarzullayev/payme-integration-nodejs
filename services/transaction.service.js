const { isValidObjectId } = require('mongoose');
const { transactionRepo, orderRepo } = require('../repositories');

const {
	PaymeError,
	PaymeData,
	TransactionState,
} = require('../enums/transaction.enum');

const TransactionError = require('../errors/transaction.error');
const { OrderStatus } = require('../enums/order.enum');

class TransactionService {
	constructor(transactionRepo, orderRepo) {
		this.transactionRepo = transactionRepo;
		this.orderRepo = orderRepo;
	}

	async checkPerformTransaction(params, id) {
		const {
			account: { order_id: orderId },
		} = params;

		let { amount } = params;

		amount = Math.floor(amount / 100);

		if (!isValidObjectId(orderId))
			throw new TransactionError(
				PaymeError.OrderNotFound,
				id,
				PaymeData.OrderId,
			);

		const order = await this.orderRepo.getById(orderId);
		if (!order)
			throw new TransactionError(
				PaymeError.OrderNotFound,
				id,
				PaymeData.OrderId,
			);

		if (amount !== order.totalPrice) {
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
			account: { order_id: orderId },
			time,
		} = params;

		if (!isValidObjectId(orderId))
			throw new TransactionError(
				PaymeError.OrderNotFound,
				id,
				PaymeData.OrderId,
			);

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

				await this.orderRepo.updateById(transaction.order_id.toString(), {
					status: OrderStatus.Canceled,
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
			order_id: orderId,
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
			order_id: orderId,
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

			await this.orderRepo.updateById(transaction.order_id, {
				status: OrderStatus.Canceled,
			});

			throw new TransactionError(PaymeError.CantDoOperation, id);
		}

		await this.transactionRepo.updateById(transaction._id.toString(), {
			state: TransactionState.Paid,
			perform_time: currentTime,
		});

		await this.orderRepo.updateById(transaction.order_id, {
			status: OrderStatus.Paid,
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

			await this.orderRepo.updateById(transaction.order_id, {
				status: OrderStatus.Canceled,
			});
		}

		return {
			cancel_time: transaction.cancel_time || currentTime,
			transaction: transaction.id,
			state: -Math.abs(transaction.state),
		};
	}

	async getStatement(params) {
		const { from, to } = params;

		return this.transactionRepo.getByDateFilter(from, to);
	}
}

module.exports = new TransactionService(transactionRepo, orderRepo);
