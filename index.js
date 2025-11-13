const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const admin = require("firebase-admin");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

//const serviceAccount = require( "./ums-auth-firebase-admin.json")

const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
//Middleware 
app.use(cors());
app.use(express.json())



// const logger = (req, res, next) => {
//     console.log('Logging Information');
//     next()
// }

//JWT Updated

const verifyFireBaseToken = async (req, res, next) => {
    console.log('In the verify middleware', req.headers.authorization);
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }

    try {
        const userInfo = await admin.auth().verifyIdToken(token);
        req.token_email = userInfo.email;
        next();
    } catch {
        return res.status(401).send({ message: 'Unauthorized access' })
    }

}

const verifyJWTToken = (req, res, next) => {

    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        // put it in the right place
        //console.log('after decoded', decoded);
        req.token_email = decoded.email;
        next();
    })


}

//Any port
const port = process.env.PORT || 3000;

// Default routes to check mongoDB is working
app.get('/', (req, res) => {
    res.send('UMS server is running')
})
app.listen(port, () => {
    console.log(`UMS server is running on port: ${port}`);
})


//MongoDB Client 
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// Main Database Connections 
async function run() {
    try {
        // DB Name - usm-db
        const db = client.db('usm-db');
        // All collections 
        const categoryCollection = db.collection('categories')
        const allBillsCollection = db.collection('bills');
        const userCollection = db.collection('users');
        const myBillsCollection = db.collection("myBills");

        // JWT Related API
        app.post('/getToken', (req, res) => {
            const loggedUser = req.body;
            const token = jwt.sign(loggedUser, process.env.JWT_SECRET, { expiresIn: '1h' })
            res.send({ token: token })
        })

        //Bill category db

        app.get("/categories", async (req, res) => {
            try {
                const result = await categoryCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching categories", error });
            }
        });


        //Recent Bills 
        app.get("/recent-bills", async (req, res) => {
            try {
                const result = await allBillsCollection.find().sort({ date: -1 }).limit(6).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching categories", error });
            }
        });


        // All bills
        app.get("/bills", async (req, res) => {
            try {
                const { category } = req.query;

                let query = {};
                if (category && category !== "All") {
                    query.category = category;
                }

                const result = await allBillsCollection
                    .find(query)
                    .sort({ date: -1 })
                    .toArray();

                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching bills", error });
            }
        });


        //Add a bill 
        app.post("/bills", verifyJWTToken, async (req, res) => {
            try {
                const newBill = req.body;
                const result = await allBillsCollection.insertOne(newBill);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to add bill", error });
            }
        });

        //Bill details
        app.get("/bills/:id", verifyJWTToken, async (req, res) => {
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



        //User DB
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

        // My bills 
        app.get("/my-bills", verifyJWTToken, async (req, res) => {
            try {
                const email = req.query.email;
                const result = await myBillsCollection.find({ email }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching user bills", error });
            }
        });


        app.post("/my-bills",verifyJWTToken, async (req, res) => {
            try {
                const newPayment = req.body;

            
                if (!newPayment.email || !newPayment.billId || !newPayment.amount) {
                    return res.status(400).send({ message: "Missing required fields" });
                }
                const result = await myBillsCollection.insertOne(newPayment);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error saving bill payment", error });
            }
        });


        app.patch("/my-bills/:id",verifyJWTToken, async (req, res) => {
            try {
                const id = req.params.id;
                const updateData = req.body;

                const result = await myBillsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateData }
                );

                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error updating bill", error });
            }
        });


        app.delete("/my-bills/:id",verifyJWTToken,  async (req, res) => {
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
       // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);
