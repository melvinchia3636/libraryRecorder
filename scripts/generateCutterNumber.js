const fs = require("fs");
const pinyin = require("chinese-to-pinyin");
const PocketBase = require("pocketbase/cjs")

function sacaAcentos(nombre) {
  // pre: ingresa un string
  //post: devuelve la string sin acentos ni dieresis
  nombre = nombre.replace("Á", "A");
  nombre = nombre.replace("É", "E");
  nombre = nombre.replace("Í", "I");
  nombre = nombre.replace("Ó", "O");
  nombre = nombre.replace("Ú", "U");
  nombre = nombre.replace("Ü", "U");
  nombre = nombre.replace("á", "A");
  nombre = nombre.replace("é", "E");
  nombre = nombre.replace("í", "I");
  nombre = nombre.replace("ó", "O");
  nombre = nombre.replace("ú", "U");
  nombre = nombre.replace("ä", "A");
  nombre = nombre.replace("Ä", "A");
  nombre = nombre.replace("ë", "E");
  nombre = nombre.replace("Ë", "E");
  nombre = nombre.replace("ï", "I");
  nombre = nombre.replace("Ï", "I");
  nombre = nombre.replace("ö", "O");
  nombre = nombre.replace("Ö", "O");
  nombre = nombre.replace("ü", "U");
  nombre = nombre.replace("Ü", "U");
  nombre = nombre.replace("Ç", "C");
  nombre = nombre.replace("à", "A");
  nombre = nombre.replace("À", "A");
  nombre = nombre.replace("è", "E");
  nombre = nombre.replace("È", "E");
  nombre = nombre.replace("ì", "I");
  nombre = nombre.replace("Ì", "I");
  nombre = nombre.replace("ò", "O");
  nombre = nombre.replace("Ò", "O");
  nombre = nombre.replace("ù", "U");
  nombre = nombre.replace("Ù", "U");
  nombre = nombre.replace("â", "A");
  nombre = nombre.replace("Â", "A");
  nombre = nombre.replace("ê", "E");
  nombre = nombre.replace("Ê", "E");
  nombre = nombre.replace("î", "I");
  nombre = nombre.replace("Î", "I");
  nombre = nombre.replace("ô", "O");
  nombre = nombre.replace("Ô", "O");
  nombre = nombre.replace("û", "U");
  nombre = nombre.replace("Û", "U");
  nombre = nombre.replace("ñ", "NZ");
  return nombre;
}

var table = fs.readFileSync("table.txt", "utf8").toString();

function cutterFunc(inputtxt) {
  var original = inputtxt;
  let tblc = table.split("\n");
  let cutter = ""; //  devuelve el valor de la tabla cutter que corresponde al input

  inputtxt = sacaAcentos(inputtxt);
  inputtxt = inputtxt.replace(" ", "");
  inputtxt = inputtxt.trim();
  inputtxt = inputtxt.toLowerCase();
  for (let j = 0; j < tblc.length - 1; j++) {
    if (inputtxt >= tblc[j].slice(4) && inputtxt < tblc[j + 1].slice(4)) {
      if (
        inputtxt[0] == "a" ||
        inputtxt[0] == "e" ||
        inputtxt[0] == "i" ||
        inputtxt[0] == "o" ||
        inputtxt[0] == "u"
      ) {
        cutter = inputtxt.slice(0, 2).toUpperCase() + tblc[j].slice(0, 3);
      } else if (inputtxt[0] == "s" && inputtxt[1] != "c") {
        cutter = inputtxt.slice(0, 2).toUpperCase() + tblc[j].slice(0, 3);
      } else if (inputtxt[0] == "s" && inputtxt[1] == "c") {
        cutter = inputtxt.slice(0, 3).toUpperCase() + tblc[j].slice(0, 3);
      } else {
        cutter = inputtxt[0].toUpperCase() + tblc[j].slice(0, 3);
      }
      cutter = cutter.replace("0", "");
      cutter = cutter.replace("0", "");
      break;
    }
  }
  return cutter;
}

// fetch("http://localhost:3000/list").then((res) => res.json()).then((books) => {
//   for (const book of books) {
//     if (book.callnum && book.callnum.split(" ").length <= 2) {
//       book.callnum = [
//         book.callnum.trim(),
//         cutterFunc(pinyin(book.author.split(",")[0])).trim(),
//         book.year || "",
//       ]
//         .join(" ")
//         .replace("  ", " ").trim();
//       fetch(`http://localhost:3000/update/${book.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           callnum: book.callnum,
//         }),
//       })
//         .then((res) => res.json())
//         .then((res) => console.log(res));
//       console.log(book.callnum);
//     }
//   }
// })

console.log(cutterFunc("Lim peng Chew"))