const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/list", async (req, res) => {
  const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
  const db = client.db("library");
  const collection = db.collection("book");
  const result = await collection.find({}).toArray();
  res.send(result);
  client.close();
});

app.get("/list/:id", async (req, res) => {
  const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
  const db = client.db("library");
  const collection = db.collection("book");
  const result = await collection.findOne({ _id: new ObjectId(req.params.id) });
  res.send(result);
  client.close();
});

app.post("/add", async (req, res) => {
  const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
  const db = client.db("library");
  const collection = db.collection("book");
  const result = await collection.insertOne(req.body);
  res.send(result);
  client.close();
});

app.put("/update/:id", async (req, res) => {
  const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
  const db = client.db("library");
  const collection = db.collection("book");
  const result = await collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  res.send(result);
  client.close();
});

app.delete("/delete/:id", async (req, res) => {
  const client = await MongoClient.connect("mongodb://127.0.0.1:27017/");
  const db = client.db("library");
  const collection = db.collection("book");
  const result = await collection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(result);
  client.close();
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
