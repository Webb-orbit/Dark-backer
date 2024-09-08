import {app} from "./app.js"
import { configDotenv } from "dotenv";
import mongoconnect from "./db/index.js";

configDotenv({path:"./.env"})
const port = process.env.PORT || 2000;

mongoconnect().then((e)=>{
    app.listen(port, ()=>{
        console.log(`mission started on ${port}`);
    })
}).catch((e)=>{
    console.log("connect failed", e);
})

