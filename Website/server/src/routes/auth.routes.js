import express from 'express'
import { registerUser, loginUser } from '../controllers/user.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { registerUserSchema, loginUserSchema } from '../validations/userSchema.js'
const router = express.Router()

router.post('/auth/register',validate(registerUserSchema), registerUser)
router.post('/auth/login',validate(loginUserSchema) ,loginUser)

export default router;
