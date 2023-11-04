const { Product } = require("../model/Product");

//update a product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    }); //for patch methods
    product.discountPrice = Math.round(
      product.price * (1 - product.discountPercentage / 100)
    );
    const updatedProduct = await product.save();
    res.status(201).json(updatedProduct);
  } catch (error) {
    res.status(400).json(error);
  }
};

//product by id
exports.fetchProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json(error);
  }
};

//create product
exports.addProduct = async (req, res) => {
  //creating an instance of the Product from the model folder
  const product = new Product(req.body);
  product.discountPrice = Math.round(
    product.price * (1 - product.discountPercentage / 100)
  );
  try {
    //saving the product
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json(error);
  }
};

//fetch product by filters sort and pagination
exports.fetchAllProduct = async (req, res) => {
  let condition = {};
  if (!req.query.admin) {
    condition.deleted = { $ne: true };
  }
  //need all query strings to fetch the data
  let query = Product.find(condition);
  //for total count
  let totalProductQuery = Product.find(condition);

  console.log(req.query.category);

  //category is also in the query
  if (req.query.category) {
    //filter object = {category: ["smartphone","laptop]"}
    query = query.find({ category: { $in: req.query.category.split(",") } });
    totalProductQuery = totalProductQuery.find({
      category: { $in: req.query.category.split(",") },
    });
  }

  //brand is also in the query
  if (req.query.brand) {
    //filter object = {brand: brandName}
    query = query.find({ brand: { $in: req.query.brand.split(",") } });
    totalProductQuery = totalProductQuery.find({
      brand: { $in: req.query.brand.split(",") },
    });
  }

  //sorting query
  //TODO: sorting should be from the discounted value
  if (req.query._sort && req.query._order) {
    //sort object = {_sort: "price", _order:"desc"}
    query = query.sort({ [req.query._sort]: req.query._order });
    totalProductQuery = totalProductQuery.sort({
      [req.query._sort]: req.query._order,
    });
  }

  //total count
  const totalDocs = await totalProductQuery.count().exec();
  // console.log({ totalDocs });

  //pagination is also in the query
  if (req.query._page && req.query._limit) {
    //pagination = {_page:1, _limit:10} //_page=1&_limit=10
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize); //skip query is used in pagination
    totalProductQuery = totalProductQuery
      .skip(pageSize * (page - 1))
      .limit(pageSize);
  }
  //saving the product
  try {
    const docs = await query.exec(); //to execute the get method
    res.set("X-Total-Count", totalDocs);
    res.status(201).json(docs);
  } catch (error) {
    res.status(400).json(error);
  }
};
