import { toyService } from './toy.service.js'
import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

export async function getToys(req, res) {
    try {
        const filterBy = {
            name: req.query.name || '',
            price: req.query.price || '',
            labels: req.query.labels || [],
            inStock: req.query.inStock || '',
        }
        const toys = await toyService.query(filterBy)
        res.send(toys)
    } catch (err) {
        loggerService.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' })
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.send(toy)
    } catch (err) {
        loggerService.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {

    try {
        const toy = req.body
        const addedCar = await toyService.add(toy)
        res.send(addedCar)
    } catch (err) {
        loggerService.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    try {
        const toy = req.body
        const updatedToy = await toyService.update(toy)
        res.send(updatedToy)
    } catch (err) {
        loggerService.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        console.log(toyId)
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        loggerService.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    const { _id, fullname } = req.loggedinUser
    try {
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: { _id, fullname },
            createdAt: Date.now(),
            id: utilService.makeId(4)
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.send(savedMsg)
    } catch (err) {
        loggerService.error('Failed to add msg', err)
        res.status(500).send({ err: 'Failed to add msg' })
    }
}

export async function removeToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const { msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        loggerService.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}