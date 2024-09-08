import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const docsschema = new Schema({
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
    shared:{
        type : Boolean,
        default: false
    },
}, {timestamps: true})

docsschema.plugin(mongooseAggregatePaginate)

export const Docs = model("Docs", docsschema)