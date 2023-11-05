const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { JSDOM } = require("jsdom");
const PocketBase = require("pocketbase/cjs");
const fs = require("fs");

async function findInOpenLibrary(isbn) {
  const bookData = await fetch(
    `https://openlibrary.org/isbn/${isbn}.json`
  ).then((response) => response.json());

  if (!bookData || bookData?.error === "notfound") {
    return [false, {}];
  }

  let data = {
    title: bookData?.title,
    author: [],
    publisher: bookData?.publishers?.join(", "),
    year: bookData?.publish_date || "",
    pages: String(bookData?.number_of_pages || ""),
    language: [],
    thumbnail: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
  };

  for (let lang of bookData?.languages || []) {
    const language = await fetch(`https://openlibrary.org${lang?.key}.json`)
      .then((response) => response.json())
      .catch(() => { });
    data = {
      ...data,
      language: [...data.language, language?.name],
    };
  }
  data.language = data.language.join(", ");

  for (let author of bookData?.authors || []) {
    const authorData = await fetch(
      `https://openlibrary.org${author?.key}.json`
    )
      .then((response) => response.json())
      .catch(() => {
        console.log(`https://openlibrary.org${author?.key}.json`);
      });
    data = {
      ...data,
      author: [...data.author, authorData?.name],
    };
  }
  data.author = data.author.join(", ");

  return [true, data];
}

async function findInTwLibrary(isbn) {
  const html = await fetch(
    `http://nbinet3.ncl.edu.tw/search~S10*cht?/i${isbn}/i${isbn}/1%2C1%2C9%2CE/frameset&FF=i${isbn}&1%2C%2C9`
  ).then((res) => res.text())

  try {
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
      switch (raw[i][0]) {
        case "國際標準書號":
          if (!raw[i][1]?.replace(/-/g, "")?.includes(isbn)) return [false, {}];
          break;
        case "著者":
          author = raw[i][1]?.replace("著", "").trim() || "";
          break;
        case "題名":
          title = raw[i][1]?.split("/")[0].trim() || "";
          break;
        case "出版項":
          const target =
            (raw[i + 1][1]?.length || 0) > (raw[i][1]?.length || 0)
              ? raw[i + 1]
              : raw[i];
          const [_publisher, _year] = target[1]?.split(",") || [];
          publisher = _publisher.split(":")[1]?.trim();
          year = parseInt(_year || "") + "" || "";
          break;
        case "面數高廣":
          pages = raw[i][1]?.match(/\d+面/)?.[0].replace("面", "") || "";
          break;
        default:
          break;
      }
    }

    return [true, {
      author,
      title,
      year,
      publisher,
      pages,
      language: "繁體中文",
    }];
  } catch (err) {
    return [false, {}]
  }
}

async function connectToPocketBase(req, res, next) {
  try {
    const pb = new PocketBase('http://192.168.0.112:8090');
    await pb.collection('books').getList(1, 1)
    req.pb = pb;
    next();
  } catch (err) {
    res.status(500);
    res.send({
      error: 'Cannot connect to PocketBase',
    });
  }
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(connectToPocketBase);

app.get("/list", async (req, res) => {
  const pb = new PocketBase('http://192.168.0.112:8090');

  try {
    const result = await pb.collection('books').getFullList({
      sort: 'callnum',
    })
    res.send(result);
  } catch (err) {
    res.send([]);
  }
});

app.get("/list/:id", async (req, res) => {
  const pb = new PocketBase('http://192.168.0.112:8090');
  try {
    const result = await pb.collection('books').getOne(req.params.id);
    res.send(result);
  } catch {
    res.send({});
  }
});

app.post("/add", async (req, res) => {
  const pb = new PocketBase('http://192.168.0.112:8090');
  await pb.admins.authWithPassword('melvinchia623600@gmail.com', 'VC8J-a}Ck-KR,^z');
  const result = await pb.collection('books').create(req.body);
  res.send(result);
});

app.put("/update/:id", async (req, res) => {
  const pb = new PocketBase('http://192.168.0.112:8090');
  await pb.admins.authWithPassword('melvinchia623600@gmail.com', 'VC8J-a}Ck-KR,^z');

  try {
    if (req.body.thumbnail) {
      await fetch(req.body.thumbnail)
        .then((res) => res.arrayBuffer())
        .then((buf) => {
          fs.writeFileSync(`./images/${req.params.id}.jpg`, Buffer.from(buf));
        }).catch(() => { });

      if (fs.existsSync(`./images/${req.params.id}.jpg`)) {
        req.body.thumbnail = new File([fs.readFileSync(`./images/${req.params.id}.jpg`)], `${req.params.id}.jpg`, { type: 'image/jpeg' });
      }
    }
    const result = await pb.collection('books').update(req.params.id, req.body);

    res.send(result);
  } catch (err) {
    res.send({});
  }

});

app.delete("/delete/:id", async (req, res) => {
  const pb = new PocketBase('http://192.168.0.112:8090');
  await pb.admins.authWithPassword('melvinchia623600@gmail.com', 'VC8J-a}Ck-KR,^z');
  const result = await pb.collection('books').delete(req.params.id);

  res.send(result);
});

app.get("/find-autofill/:isbn", async (req, res) => {
  const [success, bookData] = await findInOpenLibrary(req.params.isbn);
  if (success) return res.send(bookData);

  const [success2, bookData2] = await findInTwLibrary(req.params.isbn);
  if (success2) return res.send(bookData2);

  res.send({});
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
