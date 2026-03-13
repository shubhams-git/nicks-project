import { rewriteDraft } from '../services/geminiService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const handleRewrite = asyncHandler(async (req, res) => {
  const result = await rewriteDraft(req.validatedBody)

  res.status(200).json({
    success: true,
    data: result,
  })
})
