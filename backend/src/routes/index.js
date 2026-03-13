import { Router } from 'express'

import { healthRouter } from './healthRoutes.js'
import { rewriteRouter } from './rewriteRoutes.js'

const router = Router()

router.use('/health', healthRouter)
router.use('/rewrite', rewriteRouter)

export { router as apiRouter }
