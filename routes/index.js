var express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
var router = express.Router();

const MAXDATALENGTH = 30;

const usersFilePath  = path.join(__dirname, '../users.json'); 

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

// Define the checkSession middleware
function checkSession(req, res, next) {
  // Check if the session exists
  if (req.session && req.session.user) {
    // If session exists, proceed to the next middleware or route handler
    next();
  } else {
    // If session does not exist, redirect to the login page
    res.redirect('/login');
  }
}

// Helper function to read users from users.json
const readUsers = () => {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
};

// Helper function to write users to users.json
const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

/* GET home page. */
router.get('/', checkSession, function (req, res, next) {
  res.sendFile("views/index.html", { root: 'public' });
});

router.get('/login', function (req, res, next) {
  res.sendFile("views/login.html", { root: 'public' });
});


// Route to handle user login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(400).send('Invalid username or password.');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).send('Invalid username or password.');
  }

  req.session.user = user;
  res.redirect('/');
});

// Route to display the registration form
router.get('/register', (req, res) => {
  res.send(`
        <form action="/register" method="post">
            <input type="text" name="name" placeholder="Name" required><br>
            <input type="text" name="phonenumber" placeholder="Phone Number" required><br>
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Register</button>
        </form>
    `);
});

// Route to handle user registration
router.post('/register', async (req, res) => {
  const { name, phonenumber, username, password } = req.body;
  const users = readUsers();

  if (users.find(user => user.username === username)) {
    return res.send(`
        <form action="/register" method="post">
            <input type="text" name="name" placeholder="Name" required><br>
            <input type="text" name="phonenumber" placeholder="Phone Number" required><br>
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Register</button>
            <p>Username already exists. Please choose another one.</p>
        </form>
    `);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ name, phonenumber, username, password: hashedPassword });
  writeUsers(users);

  res.send(`
        <form action="/register" method="post">
            <input type="text" name="name" placeholder="Name" required><br>
            <input type="text" name="phonenumber" placeholder="Phone Number" required><br>
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Register</button>
            <p>Register success.</p>
            <a href="/login">To Login</a>
        </form>
    `);
});

router.get('/getThreshold', (req, res) => {
  let data = fs.readFileSync(path.join(__dirname, '../data.json'), 'utf-8');
  res.json(JSON.parse(data));
})


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
