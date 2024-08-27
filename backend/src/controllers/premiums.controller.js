const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandeller = require("../utils/asyncHandeller");

const getPremiums = asyncHandeller( async (req, res) => {
  const { symbol, expiry } = req.params;

  const data = await fetch('https://markethound.in/api/premiums?name='+symbol+'&expiry='+expiry);

  if (!data.ok)
    throw new ApiError(404, 'API cannot be fetched');

  const result = await data.json();

  return res.status(200).json(
    new ApiResponse(200, result, 'Success')
  );
});

module.exports = { getPremiums };