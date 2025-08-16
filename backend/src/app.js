import express from "express"
import cookieParser from "cookie-parser"

const app = express()



app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import UserRouter from './routes/user.routes.js'
import TaskRouter from './routes/task.routes.js'
 

app.use("/api/v1/users", UserRouter);
app.use("/api/v1/task", TaskRouter);



export {app}