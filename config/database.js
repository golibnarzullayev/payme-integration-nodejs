const mongoose = require('mongoose');

const { MONGO_URI } = require('./environments');

const connectDB = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('Connected mongodb');
	} catch (error) {
		console.log(`Database error:`, error);
		process.exit(1);
	}
};

module.exports = connectDB;
