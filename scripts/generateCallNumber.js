// ==UserScript==
// @name         Generate Call Number
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://classify.oclc.org/classify2/ClassifyDemo*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=oclc.org
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const data = [];

  const lastISBN = window.localStorage.getItem("lastISBN");

  if (!lastISBN) {
    document.querySelector("#search-standnum-txt").value = data[0]["isbn"];
    window.localStorage.setItem("lastISBN", data[0]["isbn"]);
  } else {
    const idx = data.findIndex((e) => e.isbn === lastISBN) + 1;
    document.querySelector("#search-standnum-txt").value = data[idx]["isbn"];
    window.localStorage.setItem("lastISBN", data[idx]["isbn"]);
  }

  if (!lastISBN) {
    document.querySelector("[value=Search]").click();
  } else {
    try {
      const classNumber = document.querySelector(
        "#classSummaryData tr td:nth-child(2)"
      ).innerText;
      fetch(
        `http://localhost:3000/update/${
          data[!lastISBN ? 0 : data.findIndex((e) => e.isbn === lastISBN) + 1][
            "_id"
          ]["$oid"]
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            callnum: classNumber,
          }),
        }
      ).then(() => {
        console.log("done");
      });
      setTimeout(() => {
        document.querySelector("[value=Search]").click();
      }, 2000);
    } catch {
      if (document.querySelector(".error")?.innerHTML?.includes("Sorry")) {
        setTimeout(() => {
          document.querySelector("[value=Search]").click();
        }, 2000);
      }
    }
  }
})();
