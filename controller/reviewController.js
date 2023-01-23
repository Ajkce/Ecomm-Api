const Review = require("../models/Reviews");
const Product = require("../models/products");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
  console.log(req.user);
  const { product: productId } = req.body;
  const isValidProduct = await Product.findOne({
    _id: productId,
  });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(
      `No product found with id : ${productId}`
    );
  }
  const alreadySubmittted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmittted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this product"
    );
  }

  req.body.user = req.user.userId;
  const review = await Review.create(req.body);
  res.status(200).json({ review });
};
const getAllReviews = async (req, res) => {
  //The populate method will help to get the more info about foreign keys products
  const reviews = await Review.find().populate({
    path: "product",
    select: "name company price",
  });

  res.status(200).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
  console.log(req.user);
  const singleReview = await Review.find({
    _id: req.params.id,
  });
  if (!singleReview) {
    throw new CustomError.NotFoundError(
      `Review doesn't exits with id : ${req.params.id}`
    );
  }
  res.status(200).json(singleReview);
};
const deleteReview = async (req, res) => {
  const singleReview = await Review.findOne({
    _id: req.params.id,
  });
  if (!singleReview) {
    throw new CustomError.NotFoundError(
      `Review doesn't exits with id : ${req.params.id}`
    );
  }

  checkPermissions(req.user, singleReview.user);

  //We are using the remove mthod instead of findoneanddelete to trigger the pre remove method which will delete all the reviews associated with the product
  await singleReview.remove();
  res.status(200).json({
    msg: "Sucess! Review removed",
  });
};
const updateReview = async (req, res) => {
  const { rating, title, comment } = req.body;
  const singleReview = await Review.findOne({
    _id: req.params.id,
  });
  if (!singleReview) {
    throw new CustomError.NotFoundError(
      `Review doesn't exits with id : ${req.params.id}`
    );
  }

  checkPermissions(req.user, singleReview.user);

  singleReview.rating = rating;
  singleReview.title = title;
  singleReview.comment = comment;

  await singleReview.save();

  res.status(200).json({
    msg: "Sucess! Review updated",
  });
};

const getSingleProductReviews = async (req, res) => {
  const reviews = await Review.findOne({
    product: req.params.id,
  });
  res.status(200).json({ reviews });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
