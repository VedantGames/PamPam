const mongoose = require('mongoose');

const indexSchema = new mongoose.Schema({
  name: String,
  straddleDataArray: [{
    time: String,
    strikePrice: Number,
    straddlePrice: Number
  }]
}, {
  timestamps: true
});

indexSchema.methods.setStraddleData = async function (data) {
  try {
    this.straddleDataArray = data;
    await this.save();
    return this;
  } catch (error) {
    throw error;
  }
}

const Index = mongoose.model('Index', indexSchema);

module.exports = Index;