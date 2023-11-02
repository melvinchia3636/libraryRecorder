const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const { JSDOM } = require("jsdom");

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
  try {
    const result = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(result);
  } catch {
    res.send({});
  }
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

app.get("/find-in-isbn-search/:isbn", async (req, res) => {
  fetch(`https://isbnsearch.org/isbn/${req.params.isbn}`)
    .then((res) => res.text())
    .then((html) => {
      console.log(html);
      const document = new JSDOM(html).window.document;
      console.log(document.textContent);

      return res.send({});
    });
});

app.get("/find-in-tw-library/:isbn", async (req, res) => {
  fetch(
    `http://nbinet3.ncl.edu.tw/search~S10*cht?/i${req.params.isbn}/i${req.params.isbn}/1%2C1%2C9%2CE/frameset&FF=i${req.params.isbn}&1%2C%2C9`
  )
    .then((res) => res.text())
    .then((html) => {
      const document = new JSDOM(html).window.document;
      const raw = Array.from(
        document.querySelectorAll(".bibInfoEntry table tbody tr")
      ).map((e) =>
        [...e.querySelectorAll("td")].map((e) => e.textContent?.trim())
      );

      let author = "";
      let title = "";
      let year = "";
      let publisher = "";
      let pages = "";

      for (let i = 0; i < raw.length; i++) {
        if (raw[i][0] === "國際標準書號") {
          if (!raw[i][1]?.replace(/-/g, "")?.includes(req.params.isbn)) {
            return res.send({});
          }
        }

        if (raw[i][0] === "著者") {
          author = raw[i][1]?.replace("著", "").trim() || "";
        }
        if (raw[i][0] === "題名") {
          title = raw[i][1]?.split("/")[0].trim() || "";
        }
        if (raw[i][0] === "出版項") {
          const target =
            (raw[i + 1][1]?.length || 0) > (raw[i][1]?.length || 0)
              ? raw[i + 1]
              : raw[i];
          const [_publisher, _year] = target[1]?.split(",") || [];
          publisher = _publisher.split(":")[1]?.trim();
          year = parseInt(_year || "") + "" || "";
        }

        if (raw[i][0] === "面數高廣") {
          pages = raw[i][1]?.match(/\d+面/)?.[0].replace("面", "") || "";
        }
      }

      return res.send({
        author,
        title,
        year,
        publisher,
        pages,
        language: "繁體中文",
      });
    })
    .catch((err) => {
      throw err;
      return res.send({});
    });
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
