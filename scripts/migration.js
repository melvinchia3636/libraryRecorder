const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const PocketBase = require("pocketbase/cjs");

const client = new MongoClient("mongodb://127.0.0.1:27017/");
client.connect();

const db = client.db("library");
const collection = db.collection("book");

// (async () => {
//     const books = await collection.find({}).toArray();
//     for (const book of books) {
//         book.year = parseInt(book.year || 0);
//         book.pages = parseInt(book.pages || 0);
//         delete book._id;

//         if (book.thumbnail) {
//             try {
//                 fetch(book.thumbnail)
//                     .then(res => res.arrayBuffer())
//                     .then(res => {
//                         fs.writeFileSync(`./images/${book.callnum}.jpg`, Buffer.from(res));
//                     }).catch(err => {
//                         console.log("error fetching image for ", book.title)
//                     })
//             } catch {
//                 console.log("error fetching image for ", book.title)
//             }
//         }

//         try {
//             const pb = new PocketBase('http://raspberrypi.local:8090');
//             await pb.admins.authWithPassword('melvinchia623600@gmail.com', 'VC8J-a}Ck-KR,^z');
//             if (!(await pb.collection('books').getList(1, 50, {
//                 filter: `title = '${book.title}'`,
//             })).totalItems) {
//                 await pb.collection('books').create({
//                     ...book,
//                     thumbnail: (() => {
//                         if (fs.existsSync(`./images/${book.callnum}.jpg`)) {
//                             return new File([fs.readFileSync(`./images/${book.callnum}.jpg`)], `${book.callnum}.jpg`)
//                         } else {
//                             return undefined
//                         }
//                     })()
//                 });
//                 console.log("successfully added ", book.title)
//             } else {
//                 console.log("already exists ", book.title)
//             }
//         } catch (err) {
//             console.log("error adding ", book.title)
//         }

//     }
// })();

const pb = new PocketBase('http://192.168.0.112:8090');

(async () => {
    const books = await collection.find({}).toArray();
    const booksInPB = await pb.collection('books').getList(1, 1000, {
        sort: 'callnum',
    });

    for (const book of books) {
        const target = booksInPB.items.find(item => item.title == book.title);
        await fetch(`http://localhost:3000/update/${target.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: book.language,
            }),
        })
            .then((res) => res.text())
            .then((res) => console.log(res));
    }
})();