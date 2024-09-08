import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

const app = express()
app.use(cookieParser())
app.use(express.static("public"))
app.use(express.json({limit:"20kb"}))
app.use(cors({
    origin: "*",
    credentials: true
}))


import clientrouter from "./router/client.router.js"
import docsrouter from "./router/docs.router.js"
import sharerouter from "./router/share.router.js"
app.use("/api/v1/client", clientrouter)
app.use("/api/v1/docs", docsrouter)
app.use("/api/v1/share", sharerouter)


export {app}