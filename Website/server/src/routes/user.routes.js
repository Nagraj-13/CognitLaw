import express from 'express'
import { getUserDetails } from '../controllers/user.controller.js'
import { protect } from '../middleware/Auth.middleware.js';

const router =  express.Router()

router.get('/getUser',protect,getUserDetails)

export default router;