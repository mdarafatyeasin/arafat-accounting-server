const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

app.use(cors());
// app.use(cors({
//     origin: "https://test.arafataccountingzone.com/"
// }));

// app.use(cors({
//     origin: ["https://test.arafataccountingzone.com/", "http://localhost:5000/"],
//     methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
// }));




// app.use(cors());
app.use(express.json());



// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wptsbja.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     // console.log(authHeader)
//     if (!authHeader) {
//         return res.status(401).send({ message: 'Unauthorize access' })
//     }
//     const token = authHeader.split(' ')[1];
//     // console.log(token)
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'Forbidden access' })
//         }
//         req.decoded = decoded;
//         next()
//         // console.log(decoded.email)
//     })
// }


// node mongo card operation
// function start
async function run() {
    try {
        await client.connect();
        // const freeQuestionCollection = client.db("arafat_accounting").collection("freeQuestion");
        const courseCollection = client.db("arafat_accounting").collection("course");
        const classCollection = client.db("arafat_accounting").collection("classes");
        const questionCollection = client.db("arafat_accounting").collection("questions");
        const usersCollection = client.db("arafat_accounting").collection("users");
        const requestCollection = client.db("arafat_accounting").collection("requester");



        // issue token
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = await jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })

        // =============================================GET==============================
        // get all free class
        // app.get('/quiz/:email', verifyJWT, async (req, res) => {
        //     const user = req.params.email
        //     const decodedEmail = req.decoded.email
        //     if (user === decodedEmail) {
        //         const query = {};
        //         // const cursor = questionCollection.find(query);
        //         const quiz = await questionCollection.find(query).toArray();
        //         return res.send(quiz);
        //     } else {
        //         console.log('function theka')
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }
        // })
        // get all free class
        app.get('/quiz', async (req, res) => {
            const query = {};
            // const cursor = questionCollection.find(query);
            const quiz = await questionCollection.find(query).toArray();
            return res.send(quiz);
        })

        // get a single question for exam
        app.get('/quiz/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const allquestions = await questionCollection.findOne(query);
            res.send(allquestions);
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

        // get all classes
        // app.get('/materials/:email', verifyJWT, async (req, res) => {
        //     const user = req.params.email
        //     const decodedEmail = req.decoded.email
        //     // console.log(user, decodedEmail)
        //     if (decodedEmail === user) {
        //         const query = {};
        //         // const cursor = classCollection.find(query);
        //         const materials = await classCollection.find(query).toArray();
        //         return res.send(materials);
        //     } else {
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }
        // })










        app.get('/materials/:email', async (req, res) => {
            const studentEmail = req.params.email
            const user = await requestCollection.findOne({ email: studentEmail })
            const userRole = await user.role

            if (userRole === 'cUAdmission') {
                const query = await { standard: "cUAdmission" };
                const userClass = await classCollection.find(query).toArray();
                res.send(userClass)
            }
            else if (userRole === 'uv23') {
                const query = await {};
                const userClass = await classCollection.find(query).toArray();
                res.send(userClass)
            } else {
                return res.status(403).send({ message: 'forbidden access' })
            }

            // const materials = await classCollection.find(query).toArray();
            // return res.send(materials);
            // console.log(userRole)

        })















        // get a single class  for exam
        app.get('/materials/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await classCollection.findOne(query);
            res.send(result);
        })

        // get all users
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        // get all free class
        // app.get('/quiz', async (req, res) => {
        //     const query = {};
        //     const cursor = questionCollection.find(query);
        //     const quiz = await cursor.toArray();
        //     res.send(quiz);
        // })

        // admin access admin 
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin';
            res.send(isAdmin)
        })

        // get all course
        app.get('/request',
            // verifyJWT,
            async (req, res) => {
                const query = {};
                const cursor = requestCollection.find(query);
                const request = await cursor.toArray();
                res.send(request);
            })

        // admin access admin 
        app.get('/uv23/:email', async (req, res) => {
            const email = req.params.email;
            // console.log("param", email)
            const user = await requestCollection.findOne({ email: email })
            // console.log('result', user)
            // res.send(user)
            // const isUv23 = user.role === 'uv23';
            if (user !== null) {
                const isUv23 = user.role === 'uv23';
                res.send(isUv23)
            } else {
                // console.log(isUv23)
                // res.status(404).send({ message: 'data not found' })
                res.send(false)
            }
            // const isUv23 = user.role === 'uv23';
            // res.send(isUv23)
        })

        app.get('/roles/:email', async (req, res) => {
            const email = req.params.email;
            const user = await requestCollection.findOne({ email: email })
            // const userRole = await user.role
            if (user !== null) {
                res.send(user)
            } else {
                // console.log(userRole)
                res.status(401).send({ message: 'Unauthorize access' })
                // res.send('Unauthorize')
            }
        })

        app.get('/singleRequester/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await requestCollection.findOne(query);
            res.send(result);
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

        app.post('/requester', async (req, res) => {
            const requester = req.body;
            const result = await requestCollection.insertOne(requester);
            res.send(result);
        })



        // =============================================DELETE==============================
        app.delete('/request/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await requestCollection.deleteOne(query)
            res.send(result)
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })

        // =============================================PUT==============================


        // make admin
        app.put('/user/admin/:email',
            // verifyJWT, 
            async (req, res) => {
                const email = req.params.email;
                const requester = req.decoded.email;
                const requesterAccount = await usersCollection.findOne({ email: requester })
                if (requesterAccount.role === 'admin') {
                    const filter = { email: email };
                    const updateDoc = {
                        $set: { role: 'admin' }
                    };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.send(result);
                } else {
                    res.status(403).send({ message: 'forbidden' })
                    // console.log('function theka')
                }
            })
        app.put('/requester/uv23/:email',
            // verifyJWT, 
            async (req, res) => {
                const email = req.params.email;
                // console.log(email)
                const currentlyAdmin = req.decoded.email;
                // const data = req.body
                // console.log(data)
                // const setRole = req.body;
                // console.log(setRole)
                // res.send(setRole)
                const admin = await usersCollection.findOne({ email: currentlyAdmin })
                if (admin.role === 'admin') {
                    const filter = { email: email };
                    const updateDoc = {
                        $set: req.body
                    };
                    const result = await requestCollection.updateOne(filter, updateDoc);
                    res.send(result);
                } else {
                    res.status(403).send({ message: 'forbidden' })
                }
            })

        // make uv-23
        // app.put('/requester/uv23/:email', verifyJWT, async (req, res) => {
        //     const email = req.params.email;
        //     // console.log('params', email)
        //     const requester = req.decoded.email;
        //     // console.log('requester', requester)
        //     const requesterAccount = await requestCollection.findOne({ email: requester })
        //     console.log('req', requesterAccount)
        //     const admin = await usersCollection.findOne({ email: requester })
        //     if (admin.role === 'admin') {
        //         const filter = { email: email };
        //         const updateDoc = {
        //             $set: { role: 'uv23' }
        //         };
        //         const result = await requestCollection.updateOne(filter, updateDoc);
        //         res.send(result);
        //     } else {
        //         res.status(403).send({ message: 'forbidden' })
        //     }
        // })
        // make uv-23





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