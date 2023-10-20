const { Order } = require("../model/Order");

exports.createOrder = async (req, res) => {
  const order = new Order(req.body);
  try {
    const doc = await order.save();
    const result = await doc.populate("user");
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.fetchLoggedInUserOrders = async (req, res) => {
  const { id } = req.user;
  try {
    const orders = await Order.find({ user: id });
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.adminUpdateOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.fetchAllOrders = async (req, res) => {
  //need all query strings to fetch the data
  let query = Order.find({ deleted: { $ne: true } });
  //for total count
  let totalOrdersQuery = Order.find({ deleted: { $ne: true } });

  //sorting query
  //TODO: sorting should be from the discounted value
  if (req.query._sort && req.query._order) {
    //sort object = {_sort: "price", _order:"desc"}
    query = query.sort({ [req.query._sort]: req.query._order });
    totalOrdersQuery = totalOrdersQuery.sort({
      [req.query._sort]: req.query._order,
    });
  }

  //total count
  const totalDocs = await totalOrdersQuery.count().exec();
  // console.log({ totalDocs });

  //pagination is also in the query
  if (req.query._page && req.query._limit) {
    //pagination = {_page:1, _limit:10} //_page=1&_limit=10
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize); //skip query is used in pagination
    totalOrdersQuery = totalOrdersQuery
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
