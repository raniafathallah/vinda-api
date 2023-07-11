const jwt = require('jsonwebtoken');
// Sign JWT
const generateToken = (id) => {
  const token=
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });

  return token;
};
module.exports = generateToken;
