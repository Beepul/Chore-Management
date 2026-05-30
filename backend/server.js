
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require("./config/db")
const mainRouter = require('./routes/index');

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
// api
app.use('/api', mainRouter);


async function start() {
  await db.connect();                   
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log("==============================")
  });
}

start();