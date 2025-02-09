const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working!');
});

module.exports = app;

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});

module.exports = app;
