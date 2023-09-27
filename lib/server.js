'use strict';

const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth.js');
const bearerAuth = require('./middleware/bearer.js');
const basicAuth = require('./middleware/basic.js');

const app = express();

// apply our middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// attach routers
app.use(authRouter);

// app.use('/api', bearerAuth);
app.post('/signin', basicAuth, (req, res) => {
    res.status(200).send(req.user);
  });

// token authenticate route
app.get('/secure', bearerAuth, (req, res) => {
  console.log('AUTHENTICATE USER', req.user);
  res.send({data: req.user});
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });  

module.exports = {
  app,
  start: (port) => {
    app.listen(port, () => console.log('App is listening!'));
  }
}