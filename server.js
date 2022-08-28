const { Server } = require("http");
const express = require("express");
const { resolve } = require("path");

const app = express();
const server = new Server(app);
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.use("/", express.static(resolve("_build")));