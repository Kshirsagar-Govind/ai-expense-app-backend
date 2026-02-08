import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyToken, TokenPayload } from "../utils/jwt";
import User from "../models/user.model";

export interface IUser {
  id: string;
  name?: string;
  email?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

export const authenticateUser = async (
  req: Request,
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

    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Token not provided" });
    }

    try {
      const decoded = verifyToken(token) as TokenPayload;

      // Optionally verify user still exists in database
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
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "Authentication failed" });
  }
};
