const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wptsbja.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// node mongo card operation
// function start
async function run() {
    try {
        await client.connect();
        const freeQuestionCollection = client.db("arafat_accounting").collection("freeQuestion");
        const courseCollection = client.db("arafat_accounting").collection("course");
        const usersCollection = client.db("arafat_accounting").collection("users");
        const questionCollection = client.db("arafat_accounting").collection("questions")



        // get all free class
        app.get('/freeclass', async (req, res) => {
            const query = {};
            const cursor = freeQuestionCollection.find(query);
            const freeclass = await cursor.toArray();
            res.send(freeclass);
        })
        // get a single question for exam
        app.get('/freeclass/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const question = await freeQuestionCollection.findOne(query);
            res.send(question);
        })

        app.post('/quiz', async (req, res) => {
            const question = req.body;
            const result = await questionCollection.insertOne(question);
            res.send(result);
        })

        // get all course
        app.get('/course', async (req, res) => {
            const query = {};
            const cursor = courseCollection.find(query);
            const course = await cursor.toArray();
            res.send(course);
        })

        // get a single question for exam
        app.get('/course/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const course = await courseCollection.findOne(query);
            res.send(course);
        })
        // post users
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}


// function for catch error
run().catch(console.dir);




// for server check 
app.get('/', (req, res) => {
    res.send("Server is running");
})

app.listen(port, () => {
    console.log("server is running on " + port);
})