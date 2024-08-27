const express = require('express');
const cors = require('cors');

const fs = require('fs')

const mongoose = require('mongoose');
const Index = require('./Index.model');

const mongoURL = 'mongodb+srv://guptavedant2549:Vedant2549@markethoundcluster.qxyce.mongodb.net/?retryWrites=true&w=majority&appName=MarketHoundCluster';

const app = express();


app.use(cors({
origin: 'http://localhost:5173',
credentials: true
}))

app.use(express.json());

async function connectDB() {
  console.log('Connecting to MongoDB...');
  try {
    const connectionInstance = await mongoose.connect(mongoURL);
    console.log('MongoDB connected successfully !! DB Host ' + connectionInstance.connection.host)
  } catch (err) {
    console.log('MongoDB connection failed ' + err);
    process.exit(1);
  }
}

const straddleDataArray = [];
const fetchInterval = 1000;
const marketOpenTime = "09:15:00";
const marketCloseTime = "15:30:00";

const indeciesList = ['NIFTY', 'FINNIFTY', 'BANKNIFTY', 'MIDCPNIFTY', 'USDINR', 'BANKEX'];
const indiceTypes = ['indices?symbol=', 'indices?symbol=', 'indices?symbol=', 'indices?symbol=', 'currency?symbol=', 'indices?symbol=']

function getCurrentTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

async function getNiftyOptionChainData() {
    const response = indeciesList.map(async (index, i) => {
        try {
            const d = await fetch('https://www.nseindia.com/api/option-chain-'+indiceTypes[i]+index, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    }
                })
                if (!d.ok) {
                console.error(`Error fetching data for ${index}:`);
                return null;
            }
            // console.log('data ', d.ok);
            return await d.json();
        } catch (error) {
            console.error(error);
        }
    })

    // var response = [];
    // for (var i = 0; i < indeciesList.length; i++) {
    //     var index = indeciesList[i];
    //     const indexData = await fetch('https://www.nseindia.com/api/option-chain-'+indiceTypes[i]+index, {
    //         headers: {
    //             'User-Agent': 'Mozilla/5.0',
    //             'Accept-Language': 'en-US,en;q=0.9',
    //             'sec-fetch-mode': 'cors',
    //             'sec-fetch-site': 'same-origin',
    //         }
    //     });
    //     console.log('data ', index, indexData);
    //     response.push(indexData);
    // }
    // const data = response.map(async index => await index.json());
    var data = [];
    var tdata = null;
    for(var i = 0; i <= response.length; i++) {
        data.push(await response[i]);
    }
    return data;
}

function getATMStraddle(data) {
    // console.log(data)
    // data.map(index => {
    //     fs.writeFile('1.json', JSON.stringify(index.records, null, 2), (err) => {
    //         if (err) throw err;
    //     });
    // })
    const allSpotPrices = data.map(index => index?.records?.underlyingValue);
    const atmStrikePrices = allSpotPrices.map(spotPrice => Math.round(spotPrice / 50) * 50);
    const atmOptions = data.map((index, i) => index?.filtered?.data?.find(option => option?.strikePrice === atmStrikePrices[i]));

    // console.log(atmOptions);
    
    atmOptions.map((atmOption, i) => {
        if (atmOption) {
            console.log({
                name: indeciesList[i],
                time: new Date().toLocaleTimeString(),
                strikePrice: atmStrikePrices[i],
                straddlePrice: atmOption?.CE?.lastPrice + atmOption?.PE?.lastPrice
            })
            return {
                name: indeciesList[i],
                time: new Date().toLocaleTimeString(),
                strikePrice: atmStrikePrices[i],
                straddlePrice: atmOption?.CE?.lastPrice + atmOption?.PE?.lastPrice
            };
        } else {
            console.log('ATM strike price not found in the option chain.', indeciesList[i]);
        }
    })
}

async function fetchAndStoreStraddleData() {
    const currentTime = getCurrentTime();

    // if (currentTime >= marketOpenTime && currentTime <= marketCloseTime) {
        try {
            const optionChainData = await getNiftyOptionChainData();
            const straddleData = getATMStraddle(optionChainData);
            straddleDataArray.push(straddleData);

            // const nifty = await Index.findOne({ name: 'nifty' });
            // const sentData = await nifty.setStraddleData(straddleDataArray);
            // console.log(sentData);
        } catch (error) {
            console.error('Error fetching or processing data:', error);
        }
    // }
}

app.get("/get-nifty-data", async (req, res) => {
  const nifty = await Index.findOne({ name: 'nifty' })
  
  if (!nifty) {
    return res.status(404).json({ message: 'Nifty data not found' });
  }

  return res.json(nifty.straddleDataArray);
});

connectDB().then(async () => {
  const existingNifty = await Index.findOne({ name: 'nifty' });
  if (!existingNifty) {
    Index.create({ name: 'nifty' });
  }

  const data = await fetch('https://markethound.in/api/premiums?name=NIFTY&expiry=2024-08-29T00:00:00.000Z');
//   console.log(await data.json())
const d = await data.json();
  fs.writeFile('1.json', JSON.stringify(d, null, 2), (err) => {
        if (err) throw err;
    });
  app.listen(8000, () => {
    console.log('Server running on port 8000');
    // const fetchIntervalId = setInterval(fetchAndStoreStraddleData, fetchInterval);
    const fetchIntervalId = fetchAndStoreStraddleData();//setInterval(fetchAndStoreStraddleData, fetchInterval);
  });
})
