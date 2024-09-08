import { Router } from "express";
import { createdoc, deletedoc, getonedoc, listclientdocs, updatedoc } from "../controls/docs.control.js";
import varifyjwt from "../middileware/varifyjwt.js";

const router = Router()

router.use(varifyjwt)

router.route("/create").post(createdoc)
router.route("/get/:docid").get(getonedoc)
router.route("/c/:docid").patch(updatedoc)
router.route("/d/:docid").delete(deletedoc)
router.route("/alldocs").get(listclientdocs)

export default router