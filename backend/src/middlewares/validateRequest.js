export const validateRequest = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || 'Invalid request body')
    error.statusCode = 400
    return next(error)
  }

  req.validatedBody = result.data
  next()
}
