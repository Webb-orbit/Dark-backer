import { Client } from "../models/client.model.js";
import { Apipromise } from "../utlies/Apipromise.js";
import Erres from "../utlies/Erres.js";
import Response from "../utlies/Response.js";
import {uploadfile, deletefile} from "../middileware/uoloadcolud.js"

const GenerateAccessRefreshToken = async (uesrid) => {
    try {
        const user = await Client.findById(uesrid)
        const accesstoken = await user.GenerateAccessToken()
        const refreshtoken = await user.GenerateRefreshToken()
        user.refreshtokan = refreshtoken
        await user.save({ validateBeforeSave: false })

        return { accesstoken, refreshtoken }
    } catch (error) {
        throw new Erres(500, "something wrong generating tokens")
    }
}
const options = {
    httpOnly: true,
    secure: true
}

const createclent = Apipromise(async (req, res) => {
    const { email, username, password } = req.body
    const avater = req.file

    if ([email, username, password].some(e => e.trim() === "")) {
        throw new Erres(400, "all filds are required")
    }
    if (!avater) {
        throw new Erres(400, "avater is required")
    }

    const clientare = await Client.findOne({ email })

    if (clientare) {
        throw new Erres(500, "email is taked by other user")
    }

    const uploadavatar = await uploadfile(avater.path)
    if (!uploadavatar) {
        throw new Erres(500, "unseccess on upload avatar in server")
    }

    const newuser = await Client.create({ email, username, password, logo:uploadavatar.url })
    const cresteduer = await Client.findById(newuser._id).select("-password -apikey -refreshtokan")
    if (!cresteduer) {
        await deletefile(uploadavatar.url)
        throw new Erres(500, "Acc creation is not successdull")
    }

    res.status(200)
        .json(new Response(200, { ...cresteduer._doc }, `${username} your new acc created`))
})

const loginuser = Apipromise(async (req, res) => {
    const { email, password } = req.body

    if ([email, password].some(e => e.trim() === "")) {
        throw new Erres(400, "all filds are required")
    }

    const userexgist = await Client.findOne({email})

    if (!userexgist) {
        throw new Erres(400, "account not found")
    }

    const passwordcorrect = await userexgist.comparepass(password)

    if (!passwordcorrect) {
        throw new Erres(400, "password not mached")
    }

    const { accesstoken, refreshtoken } = await GenerateAccessRefreshToken(userexgist._id)

    const currentuser = await Client.findById(userexgist._id).select("-password -apikey -refreshtokan")

    res.status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refreshtoken", refreshtoken, options)
        .json(new Response(200, {...currentuser?._doc, accesstoken, refreshtoken}, "user logined"))

})


const logoutuser = Apipromise(async (req, res) => {
    const user = await Client.findByIdAndUpdate(req.client._id, {
        $unset: {
            refreshtokan: 1
        }
    }, { new: true })
    if (!user) {
        throw new Erres(404, "user not found")
    }

    res.status(200)
        .clearCookie("accesstoken", options)
        .clearCookie("refreshtoken", options)
        .json(new Response(200, {}, "user log outed"))
})

const addapikey = Apipromise(async (req, res) => {
    const { apikey } = req.body
    if (!apikey) {
        throw new Erres(400, "apikey is required")
    }
    const addapikey = await Client.findByIdAndUpdate(req.client._id, {
        apikey
    }, { new: true }).select("-password -refreshtokan")
    if (!addapikey) {
        throw new Erres(400, "update not successfull")
    }

    res.status(200)
        .json(new Response(200, addapikey, "apikey updated"))
})

const deleteapikey = Apipromise(async(req, res)=>{
    const remove = await Client.findByIdAndUpdate(req.client._id, {
        $unset:{apikey: 1}
    }, {new: true}).select("apikey")
    if (!remove) {
        throw new Erres(400, "deleteing not successfull")
    }

    res.status(200)
    .json(new Response(200, {}, "deleteing successfull"))

})


const changepassword = Apipromise(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    if (!oldpassword || !newpassword) {
        throw new Erres(400, "old and new password is reqired")
    }

    const user = await Client.findById(req.client._id)
    if (!user) {
        throw new Erres(404, "user not found")
    }
    console.log(user);

    const comparepassword = await user.comparepass(oldpassword)
    if (!comparepassword) {
        throw new Erres(400, "your password is incorrect")
    }

    user.password = newpassword
    await user.save({ validateBeforeSave: false })

    res.status(200)
        .json(new Response(200, {}, "user password is updated"))
})

const getuser = Apipromise(async (req, res) => {
    res.status(200)
        .json(new Response(200, req.client, "your user"))
})

const getapikey = Apipromise(async (req, res) => {
    const user = await Client.findById(req.client._id).select("apikey")
    if (!user) {
        throw new Erres(400, "user not found")
    }
    res.status(200)
        .json(new Response(200, user, "api key"))
})

const updatedetails = Apipromise(async (req, res) => {
    const { email, username, apikey } = req.body
    if (!email && !username && !apikey) {
        throw new Erres(400, "email, username, apikey one of them are required")
    }

    const updateduser = await Client.findByIdAndUpdate(req.client._id, {
        $set: {
            email,
            username,
            apikey
        }
    }, { new: true }).select("-password -apikey -refreshtokan")

    if (!updateduser) {
        throw new Erres(500, "updation is failed")
    }

    res.status(200)
    .json(new Response(200, {...updateduser._doc}, "user is updated" ))
})

const updateavatar = Apipromise(async(req, res)=>{
    const avatar = req.file
    if (!avatar) {
        throw new Erres(400, "avatar is required")
    }

    const uploadnew = await uploadfile(avatar.path)
    if (!uploadnew) {
        throw new Erres(500, "new avatar not uploaded")
    }

    const update = await Client.findByIdAndUpdate(req.client._id,{
        $set:{
            logo: uploadnew.url
        }
    }, {new:true}).select("logo")

    if (!update) {
        await deletefile(uploadnew.url)
        throw new Erres(500, "updatetion failed")
    }

    await deletefile(req.client.logo)

    res.status(200)
    .json(new Response(200, {...update._doc}, "logo updated"))

})

export { createclent, loginuser, logoutuser, addapikey, deleteapikey, changepassword, getuser, updatedetails, updateavatar, getapikey }