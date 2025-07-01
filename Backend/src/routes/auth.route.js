import express from 'express'
import {signup,login,logout,updateProfile,checkAuth} from '../controllers/auth.controller.js'
import {protectRoute} from '../middlewares/auth.middleware.js'

const router = express.Router();

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').post(logout)
router.route('/update-profile').put(protectRoute,updateProfile)
router.route('/check').get(protectRoute,checkAuth)

export default router;

