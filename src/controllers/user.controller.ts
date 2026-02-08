import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { generateToken } from "../utils/jwt";

export const RegisterNewUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body,'<<<<<<<<<<<<<<<');
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                msg: "Please provide name, email, and password" 
            });
        }

        // Validate email format (basic validation)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                msg: "Please provide a valid email address" 
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                msg: "Password must be at least 6 characters long" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ 
                msg: "User with this email already exists" 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Generate JWT token for immediate login
        const token = generateToken({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
        });

        // Return success response with token
        res.status(StatusCodes.CREATED).json({ 
            msg: "Account created successfully",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            }
        });
    } catch (error: any) {
        console.log(error);
        
        // Handle Sequelize unique constraint error
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(StatusCodes.CONFLICT).json({ 
                msg: "User with this email already exists" 
            });
        }

        // Handle other Sequelize errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                msg: error.errors?.[0]?.message || "Validation error" 
            });
        }

        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            msg: "An error occurred while creating the account" 
        });
    }
};

export const LoginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                msg: "Please provide both email and password" 
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                msg: "Invalid email or password" 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ 
                msg: "Invalid email or password" 
            });
        }

        // Generate JWT token
        const token = generateToken({
            id: user.id,
            name: user.name,
            email: user.email,
        });

        // Return success response with token
        res.status(StatusCodes.OK).json({ 
            msg: "User logged in successfully",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            msg: "An error occurred during login" 
        });
    }
};

export const UpdateUserData = async (req: Request, res: Response) => {
    try {

        res.status(StatusCodes.OK).json({ msg: "Users detail updated!" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: error })

    }
};

export const DeleteUser = async (req: Request, res: Response) => {
    try {

        res.status(StatusCodes.OK).json({ msg: "User account deleted!" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: error })
    }
};
