import { Router } from "express";
import varifyjwt from "../middileware/varifyjwt.js";
import { clientsallshare, createshare, getoneshare, removeshare, updateshare } from "../controls/share.control.js";

const router = Router()
router.use(varifyjwt)

router.route("/create/:docid").post(createshare)
router.route("/getone/:docid").get(getoneshare)
router.route("/c/:docid").get(updateshare)
router.route("/allshares").get(clientsallshare)
router.route("/d/:docid").delete(removeshare)

export default router