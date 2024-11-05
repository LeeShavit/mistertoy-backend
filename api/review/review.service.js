import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const reviewService = {
    query,
    getById,
    remove,
    update,
    add
}

async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        console.log(criteria)
        const collection = await dbService.getCollection('review')
        let reviews = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup: {
                    localField: 'userId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup: {
                    localField: 'toyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'toy'
                }
            },
            {
                $unwind: '$toy'
            }
        ]).toArray()
        reviews = reviews.map(review => {
            review.user = {
                _id: review.user._id,
                fullname: review.user.fullname
            }
            review.toy = {
                _id: review.toy._id,
                name: review.toy.name,
                price: review.toy.price,
            }
            review.content = review.txt
            delete review.txt
            delete review.userId
            delete review.toyId
            return review
        })
        return reviews
    } catch (err) {
        loggerService.error('Cannot get reviews', err)
        throw err
    }
}

async function getById(reviewId) {
    try {
        if(typeof reviewId === 'string') reviewId= ObjectId.createFromHexString(reviewId)
        const collection = await dbService.getCollection('review')
        let review = await collection.aggregate([
            {
                $match: { _id: reviewId }
            },
            {
                $lookup: {
                    localField: 'userId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup: {
                    localField: 'toyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'toy'
                }
            },
            {
                $unwind: '$toy'
            }
        ]).toArray()
        review= review[0]
        review = {
            _id: review._id,
            content: review.txt,
            user: {
                _id: review.user._id,
                fullname: review.user.fullname
            },
            toy: {
                _id: review.toy._id,
                name: review.toy.name,
                price: review.toy.price,
            },
        }
        return review
    } catch (err) {
        loggerService.error('Cannot get review', err)
        throw err
    }
}

async function remove(reviewId) {

    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const criteria = { _id: ObjectId.createFromHexString(reviewId) }
        if (!loggedinUser.isAdmin) {
            criteria.userId = ObjectId.createFromHexString(loggedinUser._id)
        }
        const connection = await dbService.getCollection('review')
        const { deletedCount } = await connection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        loggerService.error('Cannot remove review', err)
        throw err
    }
}

async function add(review) {
    try {
        const reviewToAdd = {
            userId: ObjectId.createFromHexString(review.userId),
            toyId: ObjectId.createFromHexString(review.toyId),
            txt: review.txt,
        }
        const connection = await dbService.getCollection('review')
        const {insertedId} = await connection.insertOne(reviewToAdd)
        return getById(insertedId)
    } catch (err) {
        loggerService.error('Cannot add review', err)
        throw err
    }
}

async function update(review) {
    try {
        const reviewToSave = {
            userId: ObjectId.createFromHexString(review.userId),
            toyId: ObjectId.createFromHexString(review.toyId),
            txt: review.txt,
        }
        const connection = await dbService.getCollection('review')
        return await connection.updateOne({ _id: ObjectId.createFromHexString(review._id) }, { $set: reviewToSave })
    } catch (err) {
        loggerService.error('Cannot update review', err)
        throw err
    }
}


function _buildCriteria(filterBy) {
    const { users, toys, txt } = filterBy
    const criteria = {}
    if (txt) criteria.txt = { $regex: filterBy.txt, $options: 'i' }
    if (users && users.length) criteria.userId = { $in: users.map(id=> ObjectId.createFromHexString(id)) } 
    if (toys && toys.length) criteria.toyId= { $in: toys.map(id=> ObjectId.createFromHexString(id)) } 
    return criteria
}