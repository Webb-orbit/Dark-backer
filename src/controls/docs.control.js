import { Apipromise } from "../utlies/Apipromise.js";
import Erres from "../utlies/Erres.js";
import Response from "../utlies/Response.js";
import { Docs } from "../models/docs.model.js";
import { isValidObjectId } from "mongoose";
import { Shared } from "../models/shared.model.js";

const createdoc = Apipromise(async (req, res) => {
    const { title, content, shared } = req.body

    if (!title) {
        throw new Erres(400, "title is required")
    }

    const newdoc = await Docs.create({
        title,
        content: content || "hello backer",
        shared,
        creator: req.client._id
    })

    if (!newdoc) {
        throw new Erres(500, "something went white createing document")
    }
    if (shared) {
        const newshare = await Shared.create({
            views: 0,
            shareddoc: newdoc._id,
            creator: req.client._id
        })

        if (!newshare) {
            throw new Erres(500, "server error when creating share")
        }
        const updareddocs = await Docs.findByIdAndUpdate(newdoc._id, {
            shareid: newshare._id
        }, {new: true})

        if (!updareddocs) {
            throw new Erres(500, "server error when upadating docs")
        }
        res.status(200)
            .json(new Response(200, { document: updareddocs, sharedocument: newshare }, "new doc created with share doc"))
    }

    res.status(200)
        .json(new Response(200, { ...newdoc._doc }, "new doc created"))
})

const getonedoc = Apipromise(async (req, res) => {
    const { docid } = req.params
    if (!isValidObjectId(docid)) {
        throw new Erres(400, "document ID is invaild")
    }

    const clientdoc = await Docs.findOne({
        $and: [
            { creator: req.client._id },
            { _id: docid }
        ]
    })

    if (!clientdoc) {
        throw new Erres(422, "you not get other user's document")
    }

    res.status(200)
        .json(new Response(200, { ...clientdoc._doc }, "your document"))
})

const updatedoc = Apipromise(async (req, res) => {
    const { docid } = req.params
    const { title, content, shared } = req.body
    if (!isValidObjectId(docid)) {
        throw new Erres(400, "document ID is invaild")
    }

    const updateddoc = await Docs.findOneAndUpdate(
        {
            $and: [
                { creator: req.client._id },
                { _id: docid }
            ]
        },
        {
            title,
            content,
            shared,
        }, { new: true }
    )

    if (!updateddoc) {
        throw new Erres(500, "something went wrong updateing document")
    }

    res.status(200)
        .json(new Response(200, { ...updateddoc._doc }, "doc updated"))

})


const deletedoc = Apipromise(async (req, res) => {
    const { docid } = req.params
    if (!isValidObjectId(docid)) {
        throw new Erres(400, "document ID is invaild")
    }

    const deleted = await Docs.findOneAndDelete(
        {
            $and: [
                { creator: req.client._id },
                { _id: docid }
            ]
        }, { new: true }
    )

    if (!deleted) {
        throw new Erres(400, "something went wrong deleting document")
    }

    if (deleted.shared) {
        await Shared.findOneAndDelete({ shareddoc: docid })
        res.status(200)
            .json(new Response(200, {}, "document and share both are deleted"))
    }

    res.status(200)
        .json(new Response(200, {}, "document deleted"))
})


const listclientdocs = Apipromise(async (req, res) => {
    const { page=0, limit=12, q } = req.query
    // ADD SHORT BY 
    const documentcount = await Docs.countDocuments({ creator: req.client._id })
    let hasmore = (documentcount - page * limit) > limit
    let searchQuery = { creator: req.client._id, };
    if (q) {
        searchQuery.title = { $regex: q, $options: "i" };
    }

    const alldocs = await Docs.aggregate([
        { $sort:{"createdAt": -1}},
        { $match: searchQuery },
        { $skip: page * limit },
        { $limit: Number(limit) },
    ])

    res.status(200)
        .json(new Response(200, { doc: [...alldocs], count: documentcount, page: Number(page), limit: Number(limit), hasmore: hasmore }, "clients documents"))
})


export { createdoc, getonedoc, updatedoc, deletedoc, listclientdocs }