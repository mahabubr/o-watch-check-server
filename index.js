require('dotenv').config()
require('colors');

const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


const port = process.env.PORT || 5000

// Middle Ware
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('O Watch Server Running')
})

// app.get("*", (req, res) => {
//     res.json({ message: "You Are in Wrong Way" })
// })


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.vlhy1ml.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        // Mongodb Collections
        const watchCategoryCollection = client.db('oWatchCheck').collection('WatchCategory')
        const watchCategoryItemsCollection = client.db('oWatchCheck').collection('WatchCategoryItems')
        const myOrdersCollection = client.db('oWatchCheck').collection('MyOrders')

        // Watch Category Area
        app.get('/watch-category', async (req, res) => {
            const query = {}
            const result = await watchCategoryCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/watch-category/:id', async (req, res) => {
            const id = req.params.id
            const filter = { category_id: id }
            const result = await watchCategoryItemsCollection.find(filter).toArray()
            res.send(result)
        })

        app.get('/watch-category/watches/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await watchCategoryItemsCollection.findOne(filter)
            res.send(result)
        })

        // My Order Area

        app.post('/my-orders', async (req, res) => {
            const orders = req.body
            const result = await myOrdersCollection.insertOne(orders)
            res.send(result)
        })

        app.get('/my-orders', async (req, res) => {
            const email = req.query.email
            const query = { booking_user_email: email }
            const result = await myOrdersCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/my-orders/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await myOrdersCollection.findOne(filter)
            res.send(result)
        })

    }
    catch (e) {
        console.log(e);
    }
}

run()

app.listen(port, () => {
    console.log(`Server Is Running in PORT ${port}`.bgMagenta);
})