import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'


export const reviewService = {
    query,
    getById,
    remove,
    update,
    add
}

async function query(filterBy) {
    try {
        const collection = await dbService.getCollection('review')
        return await collection.find().toArray()
    } catch (err) {
        loggerService.error('Cannot get reviews', err)
        throw err
    }
}

async function getById(reviewId) {
    try {
        const connection = await dbService.getCollection('review')
        return await connection.findOne({ _id: ObjectId.createFromHexString(reviewId) })
    } catch (err) {
        logger.error('Cannot get review', err)
        throw err
    }
}

async function remove(reviewId) {
    
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const criteria= { _id: ObjectId.createFromHexString(reviewId) }
        if(!loggedinUser.isAdmin){
            criteria.userId=  ObjectId.createFromHexString(loggedinUser._id) 
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
            toyId:  ObjectId.createFromHexString(review.toyId),
            txt: review.txt,
        }
        const connection = await dbService.getCollection('review')
        return await connection.insertOne(reviewToAdd)
    } catch (err) {
        loggerService.error('Cannot add review', err)
        throw err
    }
}

async function update(review) {
    try {
        const reviewToSave = {
            userId: ObjectId.createFromHexString(review.userId),
            toyId:  ObjectId.createFromHexString(review.toyId),
            txt: review.txt,
        }
        const connection = await dbService.getCollection('review')
        return await connection.updateOne({ _id: ObjectId.createFromHexString(review._id) }, { $set: reviewToSave })
    } catch (err) {
        loggerService.error('Cannot update review', err)
        throw err
    }
}


// function _buildCriteria(filterBy) {
//     const { labels, name, inStock, price } = filterBy

//     const criteria = {}
//     if (name) criteria.name= { $regex: filterBy.name, $options: 'i' } 
//     if (price) criteria.price= { price: { $gt: filterBy.price } }
//     if (inStock) criteria.inStock= inStock === 'true' ? true : false
//     if (labels && labels.length !== 0) criteria.labels= { $in: labels } 

//     return criteria
// }