// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const prismaManager = require('./utils/create/prismaManager');
const { logger } = require('./config/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const clientsRoutes = require('./routes/clientsRoutes');
// ... другие routes

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
// ... другие routes

module.exports = app;