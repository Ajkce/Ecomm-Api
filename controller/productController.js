const Product = require("../models/products");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;

  const product = await Product.create(req.body);
  res.status(200).json(product);
};
const getAllProducts = async (req, res) => {
  //Try to add pagination by yourself
  const products = await Product.find({});
  res.status(200).json(products);
};
const getSingleProduct = async (req, res) => {
  const id = req.params.id;
  const product = await Product.findOne({
    _id: id,
  }).populate('reviews');
  if (!product) {
    throw new CustomError.NotFoundError(`No product exists with id : ${id}`);
  }
  res.status(200).json(product);
};
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  console.log(req.body);

  const products = await Product.findOneAndUpdate(
    {
      _id: productId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!products) {
    throw new CustomError.NotFoundError(`No product exists with id : ${id}`);
  }
  res.status(200).json(products);
};
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new CustomError.NotFoundError(`No product exists with id : ${id}`);
  }
  await product.remove();

  res.status(200).json({
    msg: "Success! product removed",
  });
};
const uploadImage = async (req, res) => {
  console.log(req.files);
  const { image } = req.files;

  const imagePath = path.resolve(
    __dirname,
    "../public/uploads",
    `${image.name}`
  );

  await image.mv(imagePath);
  res.status(200).json({ image: `/uploads/${image.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
