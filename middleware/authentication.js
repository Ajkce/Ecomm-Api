const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid");
  } else {
    try {
      const payload = isTokenValid({ token });
      //The jwt.verify method will return the payload that was used to create the token

      const { name, userId, role } = payload;
      req.user = { name, userId, role };
      next();
    } catch (error) {
      throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnAuthorisedError(
        "Unauthorised to acess this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
