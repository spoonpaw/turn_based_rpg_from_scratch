module.exports = {
    mount: {
        public: "/",
        src: "/dist"
    },
    devOptions: {
        port: process.env.PORT || 8000,
        open: "none"
    },
    buildOptions: {
        out: "_build"
    },
    optimize: {
        bundle: true,
        minify: true,
        sourcemap: false
    }
};