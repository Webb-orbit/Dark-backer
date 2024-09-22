import { Schema, model } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const clientshema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        maxLength: [50, 'username cannot exceed 50 characters']
    },
    password: {
        type: String,
        required: true
    },
    logo: {
        type: String,
    },
    apikey: {
        type: String,
        default: null
    },
    refreshtokan: {
        type: String,
    }
}, { timestamps: true })

clientshema.pre("save", async function (next) {
    if (this.isModified("password")) {
        console.log("modified pass");
        this.password = await bcrypt.hash(this.password, 17)
        next()
    }else{
        next()
    }
})

clientshema.methods.comparepass = async function (password) {
    return await bcrypt.compare(password, this.password)
}

clientshema.methods.GenerateAccessToken = async function(){
    return await jwt.sign({_id:this._id}, process.env.AccessTokenKey, { expiresIn: process.env.AccessTokenExp })
}

clientshema.methods.GenerateRefreshToken =  async function() {
    return await jwt.sign({_id:this._id}, process.env.RefreshTokenKey, { expiresIn: process.env.RefreshTokenExp })
}

export const Client = model("Client", clientshema)