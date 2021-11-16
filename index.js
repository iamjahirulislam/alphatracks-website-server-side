const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ustke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db('cycleShop');
        const cycleCollection = database.collection('cycle');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        // get API
        app.get('/cycles', async (req, res) => {
            const cursor = cycleCollection.find({});
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        });

        app.get('/cycles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await cycleCollection.findOne(query);

            res.send(result);
        });

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };

            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders)
        })

        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // post API
        app.post('/cycles', async (req, res) => {
            const newCycle = req.body;
            // console.log(newBike);
            const addNewCycle = newCycle;
            const result = await cycleCollection.insertOne(addNewCycle);
            console.log(result);
            res.json(result);
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const doc = order;
            const result = await ordersCollection.insertOne(doc);
            res.json(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        });

        app.post('/reviews', async (req, res) => {
            const newReview = (req.body);
            const result = await reviewsCollection.insertOne(newReview);
            console.log(result);
            res.json(result);
        })

        // update API
        app.put('/cycles/:id', async (req, res) => {
            const id = req.params.id;
            const updateCycle = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    bike_name: updateCycle.bike_name,
                    image: updateCycle.image,
                    short_des: updateCycle.short_des,
                    brand: updateCycle.brand,
                    price: updateCycle.price
                }
            }
            const result = await cycleCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    serviceId: updateOrder.serviceId,
                    orderStatus: updateOrder.orderStatus,
                    userName: updateOrder.userName,
                    userPhoneNumber: updateOrder.userPhoneNumber,
                    userEmail: updateOrder.userEmail,
                    userAddress: updateOrder.userAddress,
                    bike_name: updateOrder.bike_name,
                    brand: updateOrder.brand,
                    price: updateOrder.price
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);

            res.send(result);
        })

        // delete API
        app.delete('/cycles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cycleCollection.deleteOne(query);
            console.log(result);
            res.json(result);
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})