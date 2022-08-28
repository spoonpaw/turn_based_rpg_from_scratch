// create an express app
const express = require("express")
const app = express()

app.engine('html', require('ejs').renderFile);

// use the express-static middleware
app.use(express.static(__dirname + '/_build'));

app.get('/', (req, res) => res.render(__dirname + "/_build/index.html"));



app.listen(process.env.PORT || 3000,
    () => console.log("Server is running..."));