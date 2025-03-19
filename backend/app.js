import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import aiRoutes from "./routes/ai.routes.js"
import cookieParser from "cookie-parser";
import cors from 'cors';

connect();

const app = express();

const corsOption = {
    origin: ["http://localhost:5173", "https://ai-code-room-f.vercel.app"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  
}

// middlewares
app.use(cors(corsOption));


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded( { extended: true }));
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/projects', projectRoutes)
app.use('/ai', aiRoutes)


app.get("/", function(req, res){
    res.send("hello");
})

export default app;
