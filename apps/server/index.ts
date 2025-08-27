import cors from "cors";
import express from "express";
import candleRoutes from "./routes/candles";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/candles", candleRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
