const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN2,
  credentials: true
}))


app.use(express.json());

const apiV1 = require('./api/v1');

app.use('/api/v1', apiV1);

module.exports = app;