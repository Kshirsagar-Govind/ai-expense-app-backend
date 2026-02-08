import User from "./user.model";
import Expense from "./expense.model";
import ExpenseCategory from "./expenseCategory.model";

User.hasMany(Expense, {
  foreignKey: "userId",
  as: "expenses"
});

User.hasMany(ExpenseCategory, {
  foreignKey: "userId",
  as: "expenseCategories"
});

Expense.belongsTo(ExpenseCategory, {
  foreignKey: "categoryId",
  as: "category"
});

ExpenseCategory.hasMany(Expense, {
  foreignKey: "categoryId",
  as: "expenses"
});

ExpenseCategory.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

export { User, Expense };