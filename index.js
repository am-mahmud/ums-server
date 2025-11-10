const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware

app.use(cors());
app.use(express.json())
dotenv.config();

app.get('/', (req, res) => {
    res.send('UMS server is running')
})

app.listen(port, () => {
    console.log(`UMS server is running on port: ${port}`);
})

const uri = process.env.MONGO_URI;

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

        const db = client.db('usm-db');
        const categoryCollection = db.collection('categories')

        app.get("/categories", async (req, res) => {
            try {
                const result = await categoryCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching categories", error });
            }
        });



        const recentBillsCollection = db.collection('recent-bills');
        app.get("/recent-bills", async (req, res) => {
            try {
                const result = await recentBillsCollection.find().sort({ date: -1 }).limit(6).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching categories", error });
            }
        });


        const allBillsCollection = db.collection('bills');
        app.get("/bills", async (req, res) => {
            try {
                const result = await allBillsCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching categories", error });
            }
        });


        app.post("/bills", async (req, res) => {
            try {
                const newBill = req.body;
                const result = await allBillsCollection.insertOne(newBill);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to add bill", error });
            }
        });



        //User DB
        const userCollection = db.collection('users');

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email }
            const existingUser = await userCollection.findOne(query)

            if (existingUser) {
                res.send({ message: 'User exits' })
            }
            else {
                const result = await userCollection.insertOne(newUser)
                res.send(result)
            }

        })


        //Bill by ID
        app.get("/bills/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };

                const result = await allBillsCollection.findOne(query);

                if (!result) {
                    return res.status(404).send({ message: "Bill not found" });
                }

                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching bill details", error });
            }
        });


        //mybills part 

        const myBillsCollection = db.collection("myBills");

        app.get("/my-bills", async (req, res) => {
            try {
                const email = req.query.email;
                const result = await myBillsCollection.find({ email }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching user bills", error });
            }
        });

        app.post("/my-bills", async (req, res) => {
            try {
                const newPayment = req.body;
                const result = await myBillsCollection.insertOne(newPayment);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error saving bill payment", error });
            }
        });

        app.patch("/my-bills/:id", async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;

            const result = await myBillsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            res.send(result);
        });


        app.delete("/my-bills/:id", async (req, res) => {
            try {
                const id = req.params.id;

                const result = await myBillsCollection.deleteOne({
                    _id: new ObjectId(id),
                });

                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error deleting bill", error });
            }
        });


        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);
