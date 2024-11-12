var express = require('express');
var router = express.Router();

const MAXDATALENGTH = 30;

let data = [];
genChartData();

let tempData = {
  chartData: [],
  chartLabel: [],
  original: data.slice(0, 10)
}
function getData(type) {
  return data.map(d => {
    return d[type]
  }).slice(0, 10).reverse()
}



/* GET home page. */
router.get('/', function (req, res, next) {
  res.sendFile("views/index.html", { root: 'public' });
});

router.get('/getChartData', (req, res) => {
  tempData.chartData = [[getData('n'), getData('p'), getData('k')],
  [getData('soilTemp'), getData('soilMoisture'), getData('ec'), getData('ph')],
  [getData('co2'), getData('so2'), getData('no2'), getData('temp'), getData('humi')]]
  tempData.chartLabel = data.map(d => d.timeStamp).slice(0, 10).reverse()
  tempData.original = data.slice(0, 10).reverse()
  res.json(tempData);
})

router.post('/newData', (req, res) => {
  console.log(req.body)
  try {
    if (req.body) {
      data.unshift({
        ...req.body, timeStamp: getTime('vi-VN')
      })
      if (data.length > MAXDATALENGTH) {
        data.pop();
      }
    } else {
      throw new Error("req.body is undefined")
    }
    res.status(200).json({ msg: "oke" })
  } catch (e) {
    console.log(e);
    res.status(400).json({ msg: 'check body format' })
  }
})

function genChartData() {
  for (let i = 0; i < 10; i++) {
    let tempObj = {
      n: randomFloat(10, 20),
      p: randomFloat(10, 20),
      k: randomFloat(10, 20),
      soilTemp: randomFloat(10, 20),
      soilMoisture: randomFloat(10, 20),
      ec: randomFloat(10, 20),
      ph: randomFloat(10, 20),
      co2: randomFloat(10, 20),
      so2: randomFloat(10, 20),
      no2: randomFloat(10, 20),
      temp: randomFloat(10, 20),
      humi: randomFloat(10, 20),
      timeStamp: getTime('vi-VN'),
    }
    data.push(tempObj)
  }
}

function getTime(type) {
  let date = new Date();
  return date.toLocaleString(type)
}

/**
 * Generates a random float number within a specified range and rounds it to a specified number of decimal places.
 * 
 * @param {number} min The minimum value of the range (inclusive).
 * @param {number} max The maximum value of the range (inclusive).
 * @param {number} n The number of decimal places to round to.
 * @returns A random float number within the specified range, rounded to the specified number of decimal places.
 */
function randomFloat(min, max, n) {
  return Number((Math.random() * (max - min) + min).toFixed(n));
}
module.exports = router;
