import fs from 'fs'
import { utilService } from './util.service.js'

const toys = utilService.readJsonFile('./data/toys.json')

export const todoService = {
    query,
    get,
    remove,
    save,
}

function query(filterBy) {
    return Promise.resolve(toys)
        .then(toys => {
            if (filterBy.name) {
                const regExp = new RegExp(filterBy.name, 'i')
                toys = toys.filter(toy => regExp.test(toy.name))
            }
            if (filterBy.price) toys = toys.filter(toy => toy.price > filterBy.price)
            if (filterBy.inStock === 'true') toys = toys.filter(toy => toy.inStock)
            if (filterBy.inStock === 'false') toys = toys.filter(toy => !toy.inStock)
            if (filterBy.labels.length !== 0) toys = toys.filter(toy => filterBy.labels.some(label => toy.labels.includes(label.value)))
            if (filterBy.sort) {
                switch (filterBy.sort) {
                    case 'name': toys.sort((a, b) => a.name.localeCompare(b.name))
                        break
                    case 'price': toys.sort((a, b) => a.price - b.price)
                        break
                    case 'created': toys.sort((a, b) => b.createdAt - a.createdAt)
                        break
                }
            }
            return toys
        })
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if( idx< 0) return Promise.reject('toy not fount')

    toys.splice(idx,1)
    return _saveToysToFile()
}

function save(toyToSave) {
    if (toyToSave._id) {
        const idx = todos.findIndex(toy => toyToSave._id === toy._id)
        if (idx < 0) return Promise.reject('toy not found')

        toys[idx] = {
            ...toys[idx],
            name: toyToSave.name,
            price: toyToSave.price,
            inStock: toyToSave.inStock
        }
    } else {
        toyToSave = {
            ...toyToSave,
            _id: utilService.makeId(),
            createdAt: Date.now(),
        }
        toys.unshift(toyToSave)
    }
    return _saveToysToFile().then(() => toyToSave)
}

function _saveToysToFile(toys) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null ,4)
        fs.writeFile('./data/toys.json', data, (err) => {
            if (err) return reject(err)
            resolve()
        })
    })
}