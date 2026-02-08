import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
import sequelize from "../config/db";

class ExpenseCategory extends Model<
  InferAttributes<ExpenseCategory>,
  InferCreationAttributes<ExpenseCategory>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare color: string;
  declare userId: string;
}

ExpenseCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      defaultValue:"#808080"
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
  },
  {
    sequelize,
    tableName: "expenseCategories",
    updatedAt: false
  }
);

export default ExpenseCategory;
