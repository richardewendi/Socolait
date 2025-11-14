const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use("/api/compteurs", require("./routes/compteurs"));
app.use("/api/releves", require("./routes/releves"));

app.listen(3000, () => console.log("Serveur démarré sur http://localhost:3000"));
