'use strict';

const base64 = require('base-64');
const { UserModel } = require('../models');

async function basicAuth(req, res, next) {
  // does the request contain auth headers?
  if (!req.headers.authorization) {
    next('Invalid login');
  }
  // is the encoded header valid
  let encodedString = req.headers.authorization.split(' ')[1];
  let decodedString = base64.decode(encodedString);
  let [username, password] = decodedString.split(':');
  let validUser = await UserModel.authenticateBasic(username, password);
  if (validUser) {
    req.user = validUser;
    next();
  } else {
    next(new Error('Invalid Login'));
}
}

module.exports = basicAuth;