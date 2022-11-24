const { Server } = require("http");
const express = require("express");
const { resolve } = require("path");

const app = express();
app.use(enforceHttps);

app.use("/", express.static(resolve("_build")));

const server = new Server(app);
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// On Heroku, SSL termination happens at the load balancer,
// BEFORE encrypted traffic reaches your node app.
function enforceHttps(req, res, next) {
    // Check if directly requested via https
    if (req.secure) {
        next();
        // Heroku sets a header X-Forwarded-Proto to pass the user requested protocol
    } else if ((req.headers['x-forwarded-proto'] || '').substring(0, 5) === 'https') {
        next();
        // Only redirect GET and HEAD requests
    } else if (req.method === 'GET' || req.method === 'HEAD') {
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        // redirect with 301 Moved Permanently instead of default 302
        res.redirect(301, `https://${host}${req.originalUrl}`);
    } else {
        res.status(403).send('This server requires an HTTPS connection.');
    }
}