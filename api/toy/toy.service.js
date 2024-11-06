import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'


export const toyService = {
    query,
    getById,
    remove,
    update,
    add,
    addToyMsg,
    removeToyMsg
}

async function query(filterBy) {
    try {
        const sortBy= filterBy.sortBy ? {[filterBy.sort]: 1} : {}
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('toy')
        const toys= await collection.find(criteria).sort(sortBy).toArray()
        return toys
    } catch (err) {
        loggerService.error('Cannot get toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const connection = await dbService.getCollection('toy')
        const toy = await connection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        toy.createdAt = toy._id.getTimestamp()
        return toy
    } catch (err) {
        logger.error('Cannot get toy', err)
        throw err
    }

}

async function remove(toyId) {
    console.log(toyId)
    try {
        const connection = await dbService.getCollection('toy')
        const { deletedCount } = await connection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
        return deletedCount
    } catch (err) {
        loggerService.error('Cannot remove toy', err)
        throw err
    }
}

async function add(toyToSave) {
    try {
        toyToSave.createdAt = Date.now()
        const connection = await dbService.getCollection('toy')
        const { insertedId }= await connection.insertOne(toyToSave)
        toyToSave._id= insertedId
        return toyToSave
    } catch (err) {
        loggerService.error('Cannot add toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name: toy.name,
            price: toy.price,
            labels: [...toy.labels],
            inStock: toy.inStock,
            url: toy.url,
        }
        const connection = await dbService.getCollection('toy')
        await connection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToSave })
        return toyToSave
    } catch (err) {
        loggerService.error('Cannot update toy', err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.createdAt=Date.now()
        msg.id= utilService.makeId(4)
        const connection = await dbService.getCollection('toy')
        await connection.updateOne(
            { _id: ObjectId.createFromHexString(toyId) },
            { $push: { msgs: msg } })
        return msg
    } catch (err) {
        loggerService.error('Cannot add msg', err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const connection = await dbService.getCollection('toy')
        return await connection.updateOne(
            { _id: ObjectId.createFromHexString(toyId) },
             { $pull: { msgs: { id: msgId } } })
    } catch (err) {
        loggerService.error('Cannot remove msg', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const { labels, name, inStock, price } = filterBy

    const criteria = {}
    if (name) criteria.name= { $regex: filterBy.name, $options: 'i' } 
    if (price) criteria.price= { price: { $gt: filterBy.price } }
    if (inStock) criteria.inStock= inStock === 'true' ? true : false
    if (labels && labels.length !== 0) criteria.labels= { $in: labels } 

    return criteria
}