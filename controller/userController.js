const CustomError = require("../errors");
const User = require("../models/users");
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({
    role: "user",
  }).select("-password");
  // .select(-password) will remove the password from the query

  if (users.length < 1) {
    return res.status(401).json({
      status: "Sucess",
      msg: "No user found",
    });
  }

  res.status(200).json(users);
};
const getSingleUsers = async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({
    _id: id,
  }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(200).json(user);
};
const showCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("Please provide all values");
  }

  //SO user.findByIdandUpdate will update only the properties that were provided
  //But the user.save will trigger the pre save hook and it will hash the already hashed password again so inorder to prevent this from happening we will use the isModified method on user.presave mthod on user model
  const user = await User.findOne({
    _id: req.user.userId,
  });
  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(200).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.NotFoundError("Pleasse provide all values");
  }
  const { userId } = req.user;
  const user = await User.findOne({
    _id: userId,
  });
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    msg: "Password Updated Sucessfully",
  });
};

module.exports = {
  getAllUsers,
  getSingleUsers,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError("Please provide all values");
//   }

//   const user = await User.findByIdAndUpdate(
//     {
//       _id: req.user.userId,
//     },
//     {
//       email,
//       name,
//     },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(200).json({ user: tokenUser });
// };
