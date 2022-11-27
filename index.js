require('dotenv').config()
require('colors');

const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


const port = process.env.PORT || 5000

// Middle Ware
app.use(express.json())
app.use(cors())

// Middle Were (JWT)

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_TOKEN_KEY, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

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
        const paymentsCollection = client.db('oWatchCheck').collection('Payments')
        const usersCollection = client.db('oWatchCheck').collection('Users')
        const advertisedProductCollection = client.db('oWatchCheck').collection('Advertised')
        const myWishlistCollection = client.db('oWatchCheck').collection('MyWishlist')
        const reportedAdminCollection = client.db('oWatchCheck').collection('ReportedAdmin')

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

        app.get('/watch', async (req, res) => {
            const query = {}
            const result = await watchCategoryItemsCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/watch/seller-product', async (req, res) => {
            const query = req.query.email
            const filter = { seller_email: query }
            const result = await watchCategoryItemsCollection.find(filter).toArray()
            res.send(result)
        })

        app.post("/watch", async (req, res) => {
            const product = req.body
            const result = await watchCategoryItemsCollection.insertOne(product)
            res.send(result)
        })

        app.patch('/watch/verify-seller', async (req, res) => {
            const email = req.query.email
            const filter = { seller_email: email }
            const userInfo = req.body
            // const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    seller_verified: userInfo.status
                }
            }
            const result = await watchCategoryItemsCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.get('/watch/isVerify/:email', async (req, res) => {
            const email = req.params.email
            const filter = { seller_email: email }
            const result = await watchCategoryItemsCollection.findOne(filter)
            res.send(result)
        })

        app.delete('/watch/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await watchCategoryItemsCollection.deleteOne(filter)
            res.send(result)
        })

        // My Order Area

        app.post('/my-orders', async (req, res) => {
            const orders = req.body
            const result = await myOrdersCollection.insertOne(orders)
            res.send(result)
        })

        app.get('/my-orders', verifyJWT, async (req, res) => {
            const email = req.query.email
            const query = { booking_user_email: email }
            const result = await myOrdersCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/my-orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await myOrdersCollection.findOne(filter)
            res.send(result)
        })


        // Sign Up User Information

        app.post('/user', async (req, res) => {
            const body = req.body
            const result = await usersCollection.insertOne(body)
            res.send(result)
        })

        app.get('/user', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })

        app.get('/all-users', async (req, res) => {
            const query = {}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/all-users/all-sellers', async (req, res) => {
            const query = { role: 'seller' }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/all-users/all-buyers', async (req, res) => {
            const query = { role: 'buyer' }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/all-users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })


        // Advertised Products

        app.post('/advertised', async (req, res) => {
            const product = req.body
            const result = await advertisedProductCollection.insertOne(product)
            res.send(result)
        })


        app.get('/advertised', verifyJWT, async (req, res) => {
            const query = {}
            const result = await advertisedProductCollection.find(query).toArray()
            res.send(result)
        })


        app.delete('/advertised/:id', async (req, res) => {
            const id = req.params.id
            const query = { my_product_id: id }
            const result = await advertisedProductCollection.deleteOne(query)
            res.send(result)
        })

        // Add To Wishlist Page

        app.post('/my-wishlist', async (req, res) => {
            const wishlistItem = req.body
            const result = await myWishlistCollection.insertOne(wishlistItem)
            res.send(result)
        })

        app.get('/my-wishlist', async (req, res) => {
            const email = req.query.email
            const filter = { wishlist_buyer_email: email }
            const result = await myWishlistCollection.find(filter).toArray()
            res.send(result)
        })

        // Reported Admin

        app.post('/reported-admin', async (req, res) => {
            const reportedItem = req.body
            const result = await reportedAdminCollection.insertOne(reportedItem)
            res.send(result)
        })

        app.get('/reported-admin', async (req, res) => {
            const query = {}
            const result = await reportedAdminCollection.find(query).toArray()
            res.send(result)
        })
        app.delete('/reported-admin/:id', async (req, res) => {
            const query = req.params.id
            const filter = { _id: ObjectId(query) }
            const result = await reportedAdminCollection.deleteOne(filter)
            res.send(result)
        })


        // Stripe Payment Method

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body
            const price = booking.booking_price
            const amount = price * 100

            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                "payment_method_types": [
                    "card"
                ],
            })

            res.send({
                clientSecret: paymentIntent.client_secret,
            });

        })


        app.post('/payments', async (req, res) => {
            const payment = req.body
            const result = await paymentsCollection.insertOne(payment)

            const id = payment.payment_product_id
            const filter = { _id: ObjectId(id) }

            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionID: payment.transition_id
                }
            }

            const updatedResult = await myOrdersCollection.updateOne(filter, updatedDoc)

            res.send(result)
        })


        // Implement JSON WEB TOKEN

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_TOKEN_KEY, { expiresIn: '1d' })
            res.send({ token })
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