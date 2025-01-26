const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
};

const errorLogger = (error, req, res, next) => {
  console.error(`Error: ${error.message}`);
  console.error(`Stack: ${error.stack}`);
  next(error);
};

module.exports = {
  logger,
  errorLogger
}; 