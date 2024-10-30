import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import { toyService } from './services/toy.service.js'
import { loggerService } from "./services/logger.service.js"

const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:5173',
        'http://localhost:5173'
    ],
    credentials: true
}


//express configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))

//express routing for toys:

//read list
app.get('/api/toy', ({ query }, res) => {
    const filterBy = { name: query.name || '', price: +query.price || 0, inStock: query.inStock || '', labels: query.labels || [], sort: query.sort || '' }
    toyService.query(filterBy)
        .then(toys => res.send(toys))
        .catch(err => {
            loggerService.error('Cannot find toys', err)
            res.status(500).send('Cannot find toys')
        })
})

//read item
app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    console.log(toyId)
    toyService.get(toyId)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('Cannot find toy', err)
            res.status(500).send('Cannot find toy')
        })
})

//create
app.post('/api/toy/', (req, res) => {
    const toyToSave = { ...req.body, price: +req.body.price, }
    toyService.save(toyToSave)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('Cannot create toy', err)
            res.status(500).send('Cannot create toy')
        })
})

//update
app.put('/api/toy/:toyId', (req, res) => {
    const toyToSave = {
        ...req.body,
        price: +req.body.price,
        createdAt: +req.body.createdAt
    }
    toyService.save(toyToSave)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('Cannot save toy', err)
            res.status(500).send('Cannot Save toy')
        })
})

//delete
app.delete('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.remove(toyId)
        .then(() => res.send(`toy ${toyId} removed successfully`))
        .catch(err => {
            loggerService.error('Cannot remove toy', err)
            res.status(500).send('Cannot remove toy')
        })
})

const PORT = process.env.PORT || 3030

app.listen(PORT, () => console.log(`Server ready at port ${PORT}`))