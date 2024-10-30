import express from 'express'
import cookieParser from 'cookie-parser'
import { toyService } from './services/toy.service.js'
import { loggerService } from "./services/logger.service.js"

const app = express()
const PORT = process.env.PORT || 3030

app.listen(PORT, () => console.log(`Server ready at port ${PORT}`))

//express configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


//express routing for toys:
//read list
app.get('/api/toy', ({ query }, res) => {
    const filterBy ={ name: query.name || '' , price: +query.price || 0, inStock: query.inStock || '', labels: query.labels || [], sort: query.sort  || ''}
    toyService.query(filterBy)
        .then(toys => res.send(toys))
        .catch(err => {
            loggerService.error('Cannot find toys', err)
            res.status(500).send('Cannot find toys')
        })
})

//create
app.post('/api/toy/', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot create toy')

    const toyToSave = {
        ...req.body,
        importance: +req.body.importance,
        balance: +req.body.balance,
    }
    toyService.save(toyToSave, loggedInUser)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('Cannot create toy', err)
            res.status(500).send('Cannot create toy')
        })
})

//update
app.put('/api/toy/:toyId', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot remove toy')

    const toyToSave = {
        ...req.body,
        importance: +req.body.importance,
        balance: +req.body.balance,
        createdAt: +req.body.createdAt
    }
    toyService.save(toyToSave, loggedInUser)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('Cannot save toy', err)
            res.status(500).send('Cannot Save toy')
        })
})

//read item
app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.get(toyId)
        .then(toy => res.send(toy))
        .catch(err => {
            loggerService.error('Cannot find toy', err)
            res.status(500).send('Cannot find toy')
        })
})

//delete
app.delete('/api/toy/:toyId', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot remove toy')

    const { toyId } = req.params
    toyService.remove(toyId)
        .then(() => res.send(`toy ${toyId} removed successfully`))
        .catch(err => {
            loggerService.error('Cannot remove toy', err)
            res.status(500).send('Cannot remove toy')
        })
})