import mongoose from "mongoose";

const mongoconnect = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/darkbacker`)
        console.log("mongo is connected");
    } catch (error) {
        console.log("mongo is not connect");
        console.log(error)
        process.exit(1)
    }
}


export default mongoconnect