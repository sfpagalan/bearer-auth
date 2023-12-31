'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.TOKEN_SECRET || 'supersecretsquirrel';

const userModel = (sequelize, DataTypes) => {
  const userTable = sequelize.define('Users', {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // virtual property (It doesn't exist on the table, derived from table data, and created at runtime)
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        // this funciton runs whenever I refer to this property on the record
        return jwt.sign({ username: this.username }, SECRET); // function for creating our claim.
      }
    }
  });

  // hook: something that occurs automagically -> when an event.
  userTable.beforeCreate(async (user) => {
    // encrypt the password
    user.password = await bcrypt.hash(user.password, 10);
  });
  
  userTable.authenticateBasic = async function (username, password) {
    let userRecord = await this.findOne({ where: { username }}); // valuse are pulled from DB
    let valid = await bcrypt.compare(password, userRecord.password);
    if (valid) {
      return userRecord;
    } else {
      throw new Error('Invalid credentials');
    }
  }

  userTable.authenticateToken = async function (token) {
    let parsedToken = jwt.verify(token, SECRET); // returns the payload data
    const validUser = await this.findOne({ where: { username: parsedToken.username } });
    if (validUser) {
      return validUser;
    } else {
      throw new Error('Invalid token');
    }
  }

  return userTable;
};


module.exports = userModel;