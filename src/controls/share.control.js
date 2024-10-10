import { Apipromise } from "../utlies/Apipromise.js";
import Erres from "../utlies/Erres.js";
import Response from "../utlies/Response.js";
import { isValidObjectId } from "mongoose";
import { Shared } from "../models/shared.model.js";
import { Docs } from "../models/docs.model.js";

const createshare = Apipromise(async (req, res) => {
    const { privated } = req.body
    const { docid } = req.params
    if (!isValidObjectId(docid)) {
        throw new Erres(400, "document id is invalid")
    }
    const exeitshare = await Shared.findOne({ shareddoc: docid })
    if (exeitshare) {
        throw new Erres(400, "share document is alrady created")
    }

    const newshare = await Shared.create({
        privated,
        views: 0,
        shareddoc: docid,
        creator: req.client._id
    })

    if (!newshare) {
        throw new Erres(500, "server error when creating share")
    }

    const shareddocu = await Docs.findOneAndUpdate(
        {
            $and: [
                { creator: req.client._id },
                { _id: docid }
            ]
        }, {
        shared: true,
        shareid: newshare._id
    }, { new: true })

    if (!shareddocu) {
        throw new Erres(500, "server error when updateing document")
    }

    res.status(200)
        .json(new Response(200, { ...newshare?._doc, shareddocu }, "new share are ready"))
})


const getoneshare = Apipromise(async (req, res) => {
    // TRY MONGO AGGRIGATIONS TO COMBINE SHARE AND DOCS
    const { shareid } = req.params
    if (!isValidObjectId(shareid)) {
        throw new Erres(400, "document id is invalid")
    }

    const shareedoc = await Shared.findById(shareid)
    if (!shareedoc) {
        throw new Erres(404, "share document not found")
    }

    if (req.client._id !== shareedoc.creator && shareedoc.privated) {
        throw new Erres(404, "this document is private")
    }

    const doc = await Docs.findById(shareedoc.shareddoc)

    if (!doc) {
        throw new Erres(500, "server error when fetching document")
    }

    res.status(200)
        .json(new Response(200, { ...shareedoc?._doc, doc }, "document is here"))

})

const updateshare = Apipromise(async (req, res) => {
    const { privated, views } = req.body
    const { shareid } = req.params
    if (!isValidObjectId(shareid)) {
        throw new Erres(400, "document id is invalid")
    }

    const updatedshare = await Shared.findOneAndUpdate(
        {
            _id: shareid,
            creator: req.client._id
        },
        {
            privated,
            views,
        }, { new: true }
    )

    if (!updatedshare) {
        throw new Erres(400, "server error while updateing share")
    }

    res.status(200)
        .json(new Response(200, { ...updatedshare?._doc }, "share is updated"))
})

const clientsallshare = Apipromise(async (req, res) => {
    const data = await Shared.aggregate([
        {
            $match: {
                creator: req.client._id
            }
        },
        {
            $lookup: {
                from: "docs",
                localField: "shareddoc",
                foreignField: "_id",
                as: "docdata",
            }
        },
        {
            $addFields: {
                combinedata: {
                    $arrayElemAt: ["$docdata", 0]
                }
            }
        },
        {
            $project: {
                docdata: 0 
            }
        }
    ])
    
    res.status(200)
        .json(new Response(200, { data, total: data.length }, "user shares"))
})


const removeshare = Apipromise(async (req, res) => {
    const { shareid } = req.params
    if (!isValidObjectId(shareid)) {
        throw new Erres(400, "document id invalid")
    }

    const deleteshare = await Shared.findByIdAndDelete(shareid, { new: true })
    if (!deleteshare) {
        throw new Erres(500, "server when deleteing share")
    }

    await Docs.findByIdAndUpdate(deleteshare.shareddoc, { shared: false, $unset: { shareid: 1 } }, { new: true })
    // ADD UNDO METHOT WHEN DOCS UPDATE NOT DONE OK
    res.status(200)
        .json(new Response(200, {}, "share deleted and docs updated"))
})

export { createshare, getoneshare, updateshare, clientsallshare, removeshare }