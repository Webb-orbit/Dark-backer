import { Schema, model } from "mongoose";

const offdocSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
    },
    creator:{
        type: Schema.Types.ObjectId,
        ref: "Client"
    },
    ipadd:{
        type: String,
        required: true
    }
}, {timestamps: true})

export const Offlinedoc = model("Offlinedoc", offdocSchema)