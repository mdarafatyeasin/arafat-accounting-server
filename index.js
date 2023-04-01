const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wptsbja.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log(authHeader)
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorize access" });
  }
  const token = authHeader.split(" ")[1];
  // console.log(token)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
    // console.log(decoded.email)
  });
}

// node mongo card operation
// function start
async function run() {
  try {
    await client.connect();
    const courseCollection = client
      .db("arafat_accounting")
      .collection("course");
    const classCollection = client
      .db("arafat_accounting")
      .collection("classes");
    const questionCollection = client
      .db("arafat_accounting")
      .collection("questions");
    const usersCollection = client.db("arafat_accounting").collection("users");
    const requestCollection = client
      .db("arafat_accounting")
      .collection("requester");

    // issue token
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = await jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });

    //  ===========================================course=========================================
    // *load all course
    app.get("/course", async (req, res) => {
      const query = {};
      const cursor = courseCollection.find(query);
      const course = await cursor.toArray();
      res.send(course);
    });

    // * load single course
    app.get("/course/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const course = await courseCollection.findOne(query);
      res.send(course);
    });

    //  ===========================================admin=========================================
    // * make admin
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await usersCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    });

    // * admin access admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send(isAdmin);
    });

    //  ===========================================Quiz=========================================
    // * post quiz
    app.post("/quiz", async (req, res) => {
      const question = req.body;
      const result = await questionCollection.insertOne(question);
      res.send(result);
    });

    // * get all quiz
    app.get("/quiz", async (req, res) => {
      const query = {};
      // const cursor = questionCollection.find(query);
      const quiz = await questionCollection.find(query).toArray();
      return res.send(quiz);
    });

    // * get single quiz
    app.get("/quiz/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const allquestions = await questionCollection.findOne(query);
      res.send(allquestions);
    });

    //  ===========================================Class=========================================
    // * post class
    app.post("/allclass", async (req, res) => {
      const asset = req.body;
      const result = await classCollection.insertOne(asset);
      res.send(result);
    });

    // * get all class materials depends on user roll
    app.get("/materials/:email", async (req, res) => {
      const studentEmail = req.params.email;
      console.log(studentEmail);
      const user = await requestCollection.findOne({ email: studentEmail });
      console.log(user.role);

      if (user.role === "cUAdmission") {
        const query = await { standard: "cUAdmission" };
        const userClass = await classCollection.find(query).toArray();
        res.send(userClass);
      } else if (user.role === "uv23") {
        const query = await {};
        const userClass = await classCollection.find(query).toArray();
        res.send(userClass);
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    });

    // * get single class  class materials
    app.get("/materials/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await classCollection.findOne(query);
      res.send(result);
    });

    //  ===========================================Users=========================================
    // * get all users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    // * delete / block a user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    //  ===========================================Requester=========================================
    // * post request
    app.post("/requester", async (req, res) => {
      const requester = req.body;
      const result = await requestCollection.insertOne(requester);
      res.send(result);
    });

    // * get all request
    app.get("/request", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = requestCollection.find(query);
      const request = await cursor.toArray();
      res.send(request);
    });

    // * get a single request
    app.get("/singleRequester/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await requestCollection.findOne(query);
      res.send(result);
    });

    //  * is student? / have any role
    app.get("/roles/:email", async (req, res) => {
      const email = req.params.email;
      const user = await requestCollection.findOne({ email: email });
      if (user !== null) {
        res.send(user);
      } else {
        res.status(401).send({ message: "Unauthorize access" });
      }
    });

    // * delete / block a request
    app.delete("/request/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: ObjectId(id) };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    // extra=====================================================

    app.put("/requester/uv23/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const currentlyAdmin = req.decoded.email;
      const admin = await usersCollection.findOne({ email: currentlyAdmin });
      if (admin.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: req.body,
        };
        const result = await requestCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

// function for catch error
run().catch(console.dir);

// for server check
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log("server is running on " + port);
});
