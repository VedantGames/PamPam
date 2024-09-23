const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandeller = require("../utils/asyncHandeller");

const getAllExpiries = asyncHandeller( async (req, res) => {
  const expiriesData = await fetch('https://markethound.in/api/expiries?timestamp=1');

  if (!expiriesData.ok) 
    throw new ApiError(404, 'Data can not be fetched');

  var expiries = await expiriesData.json();
  expiries = {
    ...expiries,
    result: expiries.result.map(expiry => {
      return {
        ...expiry,
        expiries: [expiry.expiries[0]]
      }
    })
  };
    return res.status(200).json(
    new ApiResponse(200, expiries, 'Success')
  );
});

module.exports = { getAllExpiries };