"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category_Parent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category_Parent.hasMany(models.Category);
    }
  }
  Category_Parent.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Category_Parent",
    }
  );
  return Category_Parent;
};
