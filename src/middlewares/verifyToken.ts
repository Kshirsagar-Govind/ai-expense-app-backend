import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyToken, TokenPayload } from "../utils/jwt";
import User from "../models/user.model";

export interface IUser {
  id: string;
  name?: string;
  email?: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Authentication invalid. Please provide a valid token." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token) as TokenPayload;

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "User not found. Token may be invalid." });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Invalid or expired token" });
  }
};
