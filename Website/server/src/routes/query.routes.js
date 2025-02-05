import express from 'express'

import { validate } from '../middleware/validate.middleware.js'
import { ContentController, QueryController } from '../controllers/query.controller.js'
import { protect } from '../middleware/Auth.middleware.js'

const router = express.Router()

router.post('/query',protect,QueryController)
router.post('/content', ContentController)

export default router;
