const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


//=========================================================================================================>

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d9zindd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toyCollection = client.db("playNexusDB").collection("toys");
        const reviewCollection = client.db("playNexusDB").collection("reviews");
        const sliderCollection = client.db("playNexusDB").collection("sliders");


        // get all toys
        app.get('/toys', async (req, res) => {
            const cursor = toyCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        // get all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // specific toy by data
        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result)
        })

        // get my toys by email
        app.get('/my-toys', async (req, res) => {

            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email }
            }

            const sortType = req.query.type === "ascending";

            const result = await toyCollection.find(query).sort({ price: sortType ? 1 : -1 }).toArray();
            res.send(result);
        });

        // category filter
        app.get("/shopByCategory/:category", async (req, res) => {
            const category = req.params.category;
            const toys = await toyCollection.find({ subCategory: category }).toArray();
            res.send(toys);
        });

        // all toy page search toy name
        app.get("/searchToys/:searchValue", async (req, res) => {
            const searchValue = req.params.searchValue;
            const result = await toyCollection.find({ toyName: { $regex: searchValue, $options: "i" } }).toArray();
            res.send(result);
        });

        // get slider data
        app.get('/sliders', async (req, res) => {
            const cursor = sliderCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // add a toy
        app.post('/add-toy', async (req, res) => {
            const toy = req.body;
            const result = await toyCollection.insertOne(toy);
            res.send(result);
        })

        // update specific toy
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateToy = req.body;

            const toy = {
                $set: {
                    price: updateToy.updatePrice,
                    availableQuantity: updateToy.updateQuantity,
                    toyDescription: updateToy.updateToyDescription
                }
            }
            const result = await toyCollection.updateOne(filter, toy, options);
            res.send(result)
        })

        // specific data delete by id
        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

//=========================================================================================================>

app.get('/', (req, res) => {
    res.send('PlayNexus is running!')
})

app.listen(port, () => {
    console.log(`PlayNexus listening on port ${port}`);
})