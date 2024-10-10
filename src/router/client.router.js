import { Router } from "express";
import { addapikey, changepassword, createclent, deleteapikey, getapikey, getuser, loginuser, logoutuser, updateavatar, updatedetails } from "../controls/client.control.js";
import varifyjwt from "../middileware/varifyjwt.js";
import { uploadmulter } from "../utlies/multerupload.js";

const router = Router();

router.route("/createclent").post(uploadmulter.single("avatar"), createclent);
router.route("/login").post(loginuser);
router.route("/logout").get(varifyjwt,logoutuser);
router.route("/c/password").patch(varifyjwt, changepassword);
router.route("/getuser").get(varifyjwt, getuser);
router.route("/c/detiles").patch(varifyjwt, updatedetails);
router.route("/c/avatar").patch(varifyjwt, uploadmulter.single("avatar"), updateavatar);
router.route("/addkey").post(varifyjwt, addapikey);
router.route("/getapikay").get(varifyjwt, getapikey);
router.route("/deleapikey").delete(varifyjwt, deleteapikey);

export default router;