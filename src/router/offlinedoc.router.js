import { Router } from "express";
import varifyjwt from "../middileware/varifyjwt.js";
import { createoffdoc, deleteoffdoc, getoneoffdoc, listclientoffdocs, updateoffdoc } from "../controls/offdoc.control.js";

const router = Router()

router.use(varifyjwt)

router.route("/create").post(createoffdoc)
router.route("/get/:offdocid").get(getoneoffdoc)
router.route("/c/:offdocid").patch(updateoffdoc)
router.route("/d/:offdocid").delete(deleteoffdoc)
router.route("/alldocs").get(listclientoffdocs)

export default router