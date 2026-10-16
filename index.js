import "dotenv/config";
import express from "express";
import cors from "cors";
import route from "./route/index.js";
import mongoos from "./db/mongoos.js";

const app = express();
const port = 3000;

mongoos();

// middleware
app.use(express.json());
app.use(cors());
app.use(route);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});