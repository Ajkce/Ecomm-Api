const User = require("../models/users");
const statusCodes = require("http-status-codes");
const CustomError = require("../errors/index");
const {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
} = require("../utils");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyUsed = await User.findOne({ email: email });
  if (emailAlreadyUsed) {
    throw new CustomError.BadRequestError("Email already used");
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const user = await User.create({ name, email, password, role });

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(201).json({ user: tokenUser });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentails");
  }

  //It is just a uttility function that returns the user name email and passoword;
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  console.log(req.signedCookies);
  res.status(201).json({ user: tokenUser });
};
const logout = async (req, res) => {
  await res.cookie("token", "logout", {
    expires: new Date(Date.now() + 1000),
    signed: true,
  });
  console.log(req.signedCookies);
  res.status(200).json({
    msg: "User logged out",
  });
};

module.exports = { register, login, logout };
