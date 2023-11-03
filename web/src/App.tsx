import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    fetch("http://localhost:3000/list")
      .then((res) => res.json())
      .then((data) => setData(data));

    setScroll(window.scrollY);

    window.addEventListener("scroll", () => {
      setScroll(window.scrollY);
    });
  }, []);

  return (
    <main className="w-full min-h-screen bg-stone-50 text-stone-600">
      <nav
        className={`w-full fixed top-0 left-0 p-8 flex items-center justify-between transition-all duration-500 ${
          scroll > 50 ? "bg-stone-50 shadow-md" : "bg-transparent"
        }`}
      >
        <h1 className="text-2xl font-medium tracking-wide flex items-center gap-2">
          <Icon icon="game-icons:bookshelf" className="text-3xl" />
          Melvin's Home Library
        </h1>
      </nav>
      <div className="grid grid-cols-5 p-16 pt-32">
        {data.map((book) => (
          <div className="p-8 flex flex-col">
            <img
              onClick={() => {
                const newThumbnail = prompt("Enter new thumbnail URL");
                if (newThumbnail) {
                  fetch(`http://localhost:3000/update/${book._id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      thumbnail: newThumbnail,
                    }),
                  })
                    .then((res) => res.json())
                    .then(() => {
                      alert("Thumbnail updated!");
                      window.location.reload();
                    });
                }
              }}
              src={
                book.thumbnail ||
                "https://placehold.co/300x400?text=No+Image&font=Lato"
              }
              alt={book.title}
              referrerPolicy="no-referrer"
              className="w-48 h-64 object-cover rounded-md"
            />

            <p className="text-xs mt-4 font-mono border-2 border-stone-600 rounded-md px-2 py-2 text-center">
              {book.callnum}
            </p>
            <p className="text-sm mt-2">{book.isbn}</p>
            <h2 className="text-xl font-medium">{book.title}</h2>
            <p className="text-sm">{book.author}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
