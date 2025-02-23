const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');
const logger = require('morgan');

require('dotenv').config();

const app = express();

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(logger(process.env.LOG_LEVEL || 'dev'));

// Роуты
app.use('/api/clients', clientRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
