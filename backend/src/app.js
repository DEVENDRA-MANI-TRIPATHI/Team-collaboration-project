import express from "express"
import cookieParser from "cookie-parser"

const app = express()



app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import UserRouter from './routes/user.routes.js'
import TaskRouter from './routes/task.routes.js'
import CommentRouter from './routes/comment.routes.js'
 

app.use("/api/v1/auth", UserRouter);
app.use("/api/v1/task", TaskRouter);
app.use("/api/v1/task", CommentRouter);



export {app}