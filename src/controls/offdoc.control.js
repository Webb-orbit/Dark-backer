import { Apipromise } from "../utlies/Apipromise.js";
import Erres from "../utlies/Erres.js";
import Response from "../utlies/Response.js";
import { Offlinedoc } from "../models/offdoc.model.js";
import { isValidObjectId } from "mongoose";

const createoffdoc = Apipromise(async (req, res) => {
    const { title, content } = req.body

    if (!title) {
        throw new Erres(400, "title is required")
    }

    const newdoc = await Offlinedoc.create({
        title,
        content,
        creator: req.client._id,
        ipadd: req.mip
    })

    if (!newdoc) {
        throw new Erres(500, "something went white createing document")
    }

    res.status(200)
        .json(new Response(200, { newdoc }, "new doc created"))
})


const getoneoffdoc = Apipromise(async (req, res) => {
    const { offdocid } = req.params
    if (!isValidObjectId(offdocid)) {
        throw new Erres(400, "document ID is invaild")
    }

    const clientdoc = await Offlinedoc.findOne({
        $and: [
            { creator: req.client._id },
            { _id: offdocid }, 
            {ipadd: req.mip}
        ]
    })

    if (!clientdoc) {
        throw new Erres(422, "you not get other user's document")
    }

    res.status(200)
        .json(new Response(200, { clientdoc }, "your document"))
})


const updateoffdoc = Apipromise(async (req, res) => {
    const { offdocid } = req.params
    const { title, content } = req.body
    if (!isValidObjectId(offdocid)) {
        throw new Erres(400, "document ID is invaild")
    }

    const updateddoc = await Offlinedoc.findOneAndUpdate(
        {
            $and: [
                { creator: req.client._id },
                { _id: offdocid },
                {ipadd: req.mip}
            ]
        },
        {
            title,
            content,
        },{new: true}
    )

    if (!updateddoc) {
        throw new Erres(500, "something went wrong updateing document")
    }

    res.status(200)
    .json(new Response(200, {updateddoc}, "offlinedoc updated"))

})


const deleteoffdoc = Apipromise(async (req, res)=>{
    const { offdocid } = req.params
    if (!isValidObjectId(offdocid)) {
        throw new Erres(400, "document ID is invaild")
    }

    const deleted = await Offlinedoc.findOneAndDelete(
        {
            $and: [
                { creator: req.client._id },
                { _id: offdocid },
                {ipadd: req.mip}
            ]
        },{new:true}
    )

    if (!deleted) {
        throw new Erres(400, "something went wrong deleting document")
    }

    res.status(200)
    .json(new Response(200, {}, "document deleted"))
})

const listclientoffdocs = Apipromise(async(req, res)=>{
    const alldocs = await Offlinedoc.find({creator: req.client._id, ipadd: req.mip})
    res.status(200)
    .json(new Response(200, {...alldocs, total: alldocs.length}, "clients offline documents"))
})

export {createoffdoc, getoneoffdoc, updateoffdoc, deleteoffdoc, listclientoffdocs}