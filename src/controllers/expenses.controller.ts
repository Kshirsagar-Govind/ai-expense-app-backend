import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Expense } from "../models";
import openai from "../utils/openai";
import { expensePrompt, expenseAnalyserPrompt } from "../promts/expense.promt";
import groq from "../config/groq";
import ExpenseCategory from "../models/expenseCategory.model";

/**
 * GET all expenses for logged-in user
 */
export const AllExpenses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const expenses = await Expense.findAll({
      where: { userId },
      include: [
        {
          model: ExpenseCategory,
          as: "category",
          attributes: ["id", "name", "color"] // or title / label je field asel
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(StatusCodes.OK).json({ msg: "Fetched all expenses.", expenses });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to fetch expenses" });
  }
};


export const AddExpensesAI = async (req: Request, res: Response) => {
  try {
    console.log('AI from expense controller not AI -----------------------------');

    const { rawExpense } = req.body;
    let userId = req.user?.id;
    if (userId == '' || userId == undefined || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid request"
      });
    }
    if (!rawExpense) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "rawExpense text required"
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: expensePrompt(rawExpense) }
      ],
      temperature: 0,
    });

    const aiResponse = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(aiResponse);

    const [expenseCategory] = await ExpenseCategory.findOrCreate({
      where: {
        name: parsed.category,
        userId
      }
    });

    let { amount, description, date } = parsed

    const expense = await Expense.create({
      amount,
      description,
      categoryId: expenseCategory.id,
      userId: userId || '',
      createdAt: date,
      source: 'ai'
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      data: expense,
    });

  } catch (error: any) {
    console.error("AI Expense Error:", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "AI parsing failed"
    });
  }
};


export const ExpenseAIAnalyser = async (req: Request, res: Response) => {
  try {

    const id = req.user?.id;
    let expenseData = await Expense.findAll({
      where: { userId: id },
      include: [
        {
          model: ExpenseCategory,
          as: "category",
          attributes: ["name"] // or title / label je field asel
        }
      ],
    });

    if (expenseData.length < 1) {
      return res.status(200).json({ msg: 'No expense added' });
    }
    // return  res.status(200).json({ msg: 'Expense analysis completed', result: {} });

    const result = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: expenseAnalyserPrompt(JSON.stringify(expenseData)) }
      ],
      temperature: 0,
    });

    const aiResponse = result.choices[0].message.content || '{}';
    console.log(aiResponse, '===============\n\n');
    const rawAIResponse = aiResponse;
    const parsed = extractJSON(rawAIResponse);


    res.status(200).json({ msg: 'Expense analysis completed', result: parsed });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "AI expense analysis failed" });
  }
}

function extractJSON(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid AI JSON");
  return JSON.parse(match[0]);
}

/**
 * ADD new expense
 */
export const AddExpenses = async (req: Request, res: Response) => {
  try {
    // const userId = req.user.id;
    const userId = req.user?.id;
    if (userId == '' || userId == undefined || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid request"
      });
    }
    const { amount, description, categoryId } = req.body;

    if (!amount) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Amount and expense type are required" });
    }

    const expense = await Expense.create({
      categoryId,
      amount,
      description,
      userId: userId || '',
      source: 'manual'
    });

    res.status(StatusCodes.CREATED).json({
      msg: "New expense added",
      expense,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to add expense" });
  }
};

/**
 * UPDATE expense
 */
export const UpdateExpenses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const { id } = req.params;
    const { amount, description, date } = req.body;

    const expense = await Expense.findOne({
      where: { id, userId },
    });

    if (!expense) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Expense not found" });
    }

    await expense.update({
      amount,
      description,
      createdAt: date
    });

    res.status(StatusCodes.OK).json({
      msg: "Expense detail updated!",
      expense,
    });

  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to update expense" });
  }
};

/**
 * DELETE expense
 */
export const RemoveExpenses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    console.log(id, '//////////////');

    const deleted = await Expense.destroy({
      where: { id, userId },
    });

    if (!deleted) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Expense not found" });
    }

    res.status(StatusCodes.OK).json({ msg: "Expense deleted!" });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Failed to delete expense" });
  }
};
