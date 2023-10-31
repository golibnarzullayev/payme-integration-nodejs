const express = require('express');
const cors = require('cors');

const { PORT } = require('./config/environments');
const routes = require('./routes');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/error-handler.middleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', routes);

app.use(errorHandler);

connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
