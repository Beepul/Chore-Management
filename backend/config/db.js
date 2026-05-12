
const mongoose = require('mongoose');

class Database {
  constructor() {
    if (Database.instance) return Database.instance;
    this.connected = false;
    Database.instance = this;
  }

  async connect() {
    if (this.connected) return;
    await mongoose.connect(process.env.MONGO_URI);
    this.connected = true;
    console.log('Database connected');
  }

  async disconnect() {
    await mongoose.disconnect();
    this.connected = false;
  }
}

module.exports = new Database();