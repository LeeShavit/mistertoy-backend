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
    console.log(filterBy)
    const criterion = []
    if (filterBy.name) criterion.push({ name: { $regex: filterBy.name, $options: 'i' } })
    if (filterBy.price) criterion.push({ price: { $gt: filterBy.price } })
    if (filterBy.inStock === 'true') criterion.push({ inStock: true })
    if (filterBy.inStock === 'false') criterion.push({ inStock: false })
    if (filterBy.labels.length !== 0) criterion.push({ labels: { $in: filterBy.labels } })

    try {
        const collection = await dbService.getCollection('toy')
        let toys
        if (criterion.length === 0) {
            toys = await collection.find().toArray()
        } else {
            const criteria = (criterion.length === 1) ? { ...criterion[0] } : { $and: [...criterion] }
            if (!filterBy.sort) {
                toys = await collection.find(criteria).toArray()
            } else {
                toys = await collection.find(criteria).sort({ [filterBy.sort]: 1 }).toArray()
            }
        }
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
        logger.error('Cannot remove toy', err)
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
        return await connection.insertOne(toyToSave)
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
        }
        const connection = await dbService.getCollection('toy')
        return await connection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToSave })
    } catch (err) {
        loggerService.error('Cannot update toy', err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        const connection = await dbService.getCollection('toy')
        const toy = await connection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        if (!toy.msgs) {
            toy.msgs = [msg]
            return await connection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $set: { ...toy } })
        } else {
            console.log(toy)
            return await connection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
        }
    } catch (err) {
        loggerService.error('Cannot add msg', err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const connection = await dbService.getCollection('toy')
        return await connection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } })
    } catch (err) {
        loggerService.error('Cannot remove msg', err)
        throw err
    }
}
