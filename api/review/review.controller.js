import { reviewService } from './review.service.js'
import { loggerService } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'


export async function getReviews(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt || '',
            toys: req.query.toys || null,
            users: req.query.users || null,
        }
        const reviews = await reviewService.query(filterBy)
        res.send(reviews)
    } catch (err) {
        loggerService.error('Failed to get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}

export async function getReview(req, res) {
    try {
        const reviewId = req.params.id
        const review = await reviewService.getById(reviewId)
        res.send(review)
    } catch (err) {
        loggerService.error('Failed to get review', err)
        res.status(500).send({ err: 'Failed to get review' })
    }
}

export async function addReview(req, res) {
    const { loggedinUser } = asyncLocalStorage.getStore()

    try {
        const review = req.body
        review.userId = loggedinUser._id
        const addedReview = await reviewService.add(review)
        res.send(addedReview)
    } catch (err) {
        loggerService.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
    }
}

export async function updateReview(req, res) {
    try {
        const review = req.body
        const updatedReview = await reviewService.update(review)
        res.send(updatedReview)
    } catch (err) {
        loggerService.error('Failed to update review', err)
        res.status(500).send({ err: 'Failed to update review' })
    }
}

export async function removeReview(req, res) {
    try {
        const reviewId = req.params.id
        await reviewService.remove(reviewId)
        res.send()
    } catch (err) {
        loggerService.error('Failed to remove review', err)
        res.status(500).send({ err: 'Failed to remove review' })
    }
}

