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
        // const freeQuestionCollection = client.db("arafat_accounting").collection("freeQuestion");
        const courseCollection = client.db("arafat_accounting").collection("course");
        const classCollection = client.db("arafat_accounting").collection("classes")
        const questionCollection = client.db("arafat_accounting").collection("questions")
        

        // =============================================GET==============================
        // get all free class
        app.get('/quiz', async (req, res) => {
            const query = {};
            const cursor = questionCollection.find(query);
            const quiz = await cursor.toArray();
            res.send(quiz);
        })

         // get a single question for exam
         app.get('/quiz/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const allquestions = await questionCollection.findOne(query);
            res.send(allquestions);
        })

        
        // // get all free class
        // app.get('/freeclass', async (req, res) => {
        //     const query = {};
        //     const cursor = freeQuestionCollection.find(query);
        //     const freeclass = await cursor.toArray();
        //     res.send(freeclass);
        // })

        //  // get a single question for exam
        //  app.get('/freeclass/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const question = await freeQuestionCollection.findOne(query);
        //     res.send(question);
        // })

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

         // get all classes
         app.get('/materials', async (req, res) => {
            const query = {};
            const cursor = classCollection.find(query);
            const materials = await cursor.toArray();
            res.send(materials);
        })

        // get a single class  for exam
        app.get('/materials/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await classCollection.findOne(query);
            res.send(result);
        })


        // get all free class
        app.get('/quiz', async (req, res) => {
            const query = {};
            const cursor = questionCollection.find(query);
            const quiz = await cursor.toArray();
            res.send(quiz);
        })

        // =============================================POST==============================

        // Input quiz
        app.post('/quiz', async (req, res) => {
            const question = req.body;
            const result = await questionCollection.insertOne(question);
            res.send(result);
        })
        
        // Input class
        app.post('/allclass', async (req, res) => {
            const asset = req.body;
            const result = await classCollection.insertOne(asset);
            res.send(result);
        })


        // =============================================DELETE==============================
        // =============================================PUT==============================
        

// \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

        // app.post('/quiz', async (req, res) => {
        //     const question = req.body;
        //     const result = await questionCollection.insertOne(question);
        //     res.send(result);
        // })
 
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