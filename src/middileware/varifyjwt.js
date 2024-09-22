import { Client } from "../models/client.model.js"
import Erres from "../utlies/Erres.js"
import jwt from "jsonwebtoken"
import { Apipromise } from "../utlies/Apipromise.js"
import ip from "ip"

const varifyjwt = Apipromise(async (req, res, next) => {
    try { 
        const AccessTokens = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer: ", "")

        if (!AccessTokens) {
            throw new Erres(400, "unautherzied user")
        }

        const accessvarifyed = jwt.verify(AccessTokens, process.env.AccessTokenKey)
        if (!accessvarifyed) {
            throw new Erres(500, "unvarifyed accesstoken")
        }

        const user = await Client.findById(accessvarifyed._id).select("-password -apikey -refreshtokan")
        if (!user) {
            throw new Erres(500, "user  not found")
        }

        req.client = user
        req.mip = ip.address()
        next()
    } catch (error) {
        throw new Erres(500, "uexpacted err on varify tokens", error)
    }
})

export default varifyjwt