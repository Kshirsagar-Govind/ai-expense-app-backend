import {Response } from "express";
import {AuthRequest as Request} from '../middlewares/verifyToken'
import { StatusCodes } from "http-status-codes"
import ExpenseType from '../models/expenseCategory.model'
import ExpenseCategory from "../models/expenseCategory.model";

export const AddExpenseType = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Authentication required" });
        }
        const {
            name,
            color
        } = req.body;
        await ExpenseType.create({ name, color, userId });
        res.status(StatusCodes.OK).json({ msg: "All expenses" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: error })
    }
};

export const AllExpenseTypes = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Authentication required" });
        }
        let categoreis = await ExpenseCategory.findAll({where:{userId:userId}});
        res.status(StatusCodes.CREATED).json({ msg: "Fetched expenses categories", expense_categories: categoreis });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: error })

    }
};

export const RemoveExpenseType = async (req: Request, res: Response) => {
    try {

        res.status(StatusCodes.OK).json({ msg: "Expense detail updated!" });

    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: error })

    }
};
export const UpdateExpenseType = async (req: Request, res: Response) => {
    try {

        res.status(StatusCodes.OK).json({ msg: "Expense deleted!" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: error })

    }
};
