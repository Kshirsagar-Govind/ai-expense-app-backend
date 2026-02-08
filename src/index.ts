import express, { Request, Response } from "express";
import routerUser from "./routes/user.routes";
import routerExpense from "./routes/expenses.routes";
import routerExpenseType from "./routes/expenseTypes.routes";
import cors from "cors";
import sequelize from "./config/db";

const app = express();

// CORS first so preflight and all responses get headers
// Use a specific origin for development to allow credentials.
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log("REQ:", req.method, req.path);
  next();
});


app.get('/health',(req:Request, res:Response)=>{
res.status(201).json({msg:"++ SERVER UP AND RUNNING"})
})

app.get('/ping',(req:Request, res:Response)=>{
res.status(201).json({msg:"++ SERVER UP AND RUNNING"})
})



app.use('/api/v1/user',  routerUser)
app.use('/api/v1/expenses', routerExpense)
app.use('/api/v1/expense/types', routerExpenseType)

export default app;