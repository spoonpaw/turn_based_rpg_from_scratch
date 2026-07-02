/* Afterlife Online landing page — vanilla JS, no dependencies. */
(function () {
    "use strict";

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- starfield + shooting stars ---------- */
    var canvas = document.getElementById("stars");
    var ctx = canvas && !reduced ? canvas.getContext("2d") : null;
    if (ctx) {
        var stars = [];
        var meteors = [];
        var W = 0, H = 0;

        function size() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function seed() {
            stars = [];
            var n = Math.floor((W * H) / 5200);
            for (var i = 0; i < n; i++) {
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    s: Math.random() < 0.85 ? 1 : 2,          // pixel size
                    depth: 0.15 + Math.random() * 0.85,        // parallax factor
                    tw: Math.random() * Math.PI * 2,           // twinkle phase
                    hue: Math.random() < 0.12 ? "255,138,216" :
                         Math.random() < 0.24 ? "125,255,212" : "239,230,255"
                });
            }
        }

        var nextMeteor = 2500;

        function frame(t) {
            ctx.clearRect(0, 0, W, H);
            var scroll = window.scrollY || 0;

            for (var i = 0; i < stars.length; i++) {
                var st = stars[i];
                var a = 0.35 + 0.55 * Math.abs(Math.sin(st.tw + t / 900));
                var y = (st.y - scroll * st.depth * 0.25) % H;
                if (y < 0) y += H;
                ctx.fillStyle = "rgba(" + st.hue + "," + a.toFixed(2) + ")";
                ctx.fillRect(st.x | 0, y | 0, st.s, st.s);
            }

            if (t > nextMeteor) {
                nextMeteor = t + 3800 + Math.random() * 5600;
                meteors.push({
                    x: Math.random() * W * 0.8 + W * 0.1,
                    y: Math.random() * H * 0.35,
                    vx: -(3.4 + Math.random() * 2.6),
                    vy: 1.7 + Math.random() * 1.3,
                    life: 1
                });
            }

            for (var m = meteors.length - 1; m >= 0; m--) {
                var me = meteors[m];
                me.x += me.vx;
                me.y += me.vy;
                me.life -= 0.014;
                if (me.life <= 0) { meteors.splice(m, 1); continue; }
                ctx.strokeStyle = "rgba(255,215,94," + (me.life * 0.9).toFixed(2) + ")";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(me.x, me.y);
                ctx.lineTo(me.x - me.vx * 9, me.y - me.vy * 9);
                ctx.stroke();
            }

            requestAnimationFrame(frame);
        }

        window.addEventListener("resize", function () { size(); seed(); });
        size();
        seed();
        requestAnimationFrame(frame);
    }

    /* ---------- scroll reveals ---------- */
    var revealed = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduced) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add("on");
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });
        revealed.forEach(function (el) { io.observe(el); });
    } else {
        revealed.forEach(function (el) { el.classList.add("on"); });
    }
}());
