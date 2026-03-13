import { Router } from 'express'

import { handleRewrite } from '../controllers/rewriteController.js'
import { validateRequest } from '../middlewares/validateRequest.js'
import { rewriteSchema } from '../validators/rewriteValidator.js'

const router = Router()

router.post('/', validateRequest(rewriteSchema), handleRewrite)

export { router as rewriteRouter }
