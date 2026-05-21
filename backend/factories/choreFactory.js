const ChoreModel = require("../models/Chore.model");

class ChoreFactory {
  static createChore(type, choreData) {
    switch (type) {
      case "cleaning":
        return new ChoreModel({
          ...choreData,
          category: "Cleaning",
          priority: "high"
        });

      case "cooking":
        return new ChoreModel({
          ...choreData,
          category: "Cooking",
          priority: "medium"
        });

      case "shopping":
        return new ChoreModel({
          ...choreData,
          category: "Shopping",
          priority: "low"
        });

      default:
        return new ChoreModel({
          ...choreData,
          category: choreData.category
        });
    }
  }
}

module.exports = ChoreFactory;