import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware.js'
import { getUsersForSidebar,getMessages,sendMessage } from '../controllers/message.controller.js'

const router = express.Router()

router.route("/users").get(protectRoute,getUsersForSidebar)
router.route("/:id").get(protectRoute,getMessages)
router.route("/send/:id").post(protectRoute,sendMessage)

export default router;