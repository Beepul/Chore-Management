const ChoreRepository = require("../repositories/choreRepository");
const ChoreService = require("../services/choreService");
const ChoreController = require("../controllers/choreController");

class ChoreFactory {
  static createController() {
    // 1. Create the repository
    const repository = new ChoreRepository();
    
    // 2. Inject the repository into the service
    const service = new ChoreService(repository);
    
    // 3. Inject the service into the controller
    const controller = new ChoreController(service);
    
    // 4. Return the fully wired controller
    return controller;
  }
}

module.exports = ChoreFactory;