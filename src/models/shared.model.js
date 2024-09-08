import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const sharedshema = new Schema({
    privated: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    shareddoc: {
        type: Schema.Types.ObjectId,
        ref: "Docs"
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "Client"
    }
}, { timestamps: true })

sharedshema.plugin(mongooseAggregatePaginate)

export const Shared = model("Shared", sharedshema)