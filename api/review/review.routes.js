import express from 'express'
import { requireAuth } from '../../middleware/requireAuth.middleware.js'
import { log } from '../../middleware/logger.middleware.js'
import { getReviews, getReview, addReview, updateReview, removeReview } from './review.controller.js'

export const reviewRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

reviewRoutes.get('/', log, getReviews)
reviewRoutes.get('/:id', getReview)
reviewRoutes.post('/', requireAuth, addReview)
reviewRoutes.put('/:id', requireAuth, updateReview)
reviewRoutes.delete('/:id', requireAuth, removeReview)
