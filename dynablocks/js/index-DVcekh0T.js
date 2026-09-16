(function() {
    const n = document.createElement("link").relList;
    if (n && n.supports && n.supports("modulepreload")) return;
    for (const t of document.querySelectorAll('link[rel="modulepreload"]')) c(t);
    new MutationObserver(t => {
        for (const e of t)
            if (e.type === "childList")
                for (const o of e.addedNodes) o.tagName === "LINK" && o.rel === "modulepreload" && c(o)
    }).observe(document, {
        childList: !0,
        subtree: !0
    });

    function r(t) {
        const e = {};
        return t.integrity && (e.integrity = t.integrity), t.referrerPolicy && (e.referrerPolicy = t.referrerPolicy), t.crossOrigin === "use-credentials" ? e.credentials = "include" : t.crossOrigin === "anonymous" ? e.credentials = "omit" : e.credentials = "same-origin", e
    }

    function c(t) {
        if (t.ep) return;
        t.ep = !0;
        const e = r(t);
        fetch(t.href, e)
    }
})();
const a = document.getElementById("odometer-rainbow");
if (a) {
    const s = e => String(e).padStart(2, "0"),
        n = new Date("2026-09-19T11:00:00-07:00");
    let r;
    const c = [];
    for (let e = 0; e < 8; e++) {
        const o = document.createElement("span");
        if (o.className = `hit-counter__digit hit-counter__digit--c${e}`, o.textContent = "0", a.appendChild(o), c.push(o), e % 2 === 1 && e < 7) {
            const i = document.createElement("span");
            i.className = "hit-counter__sep", i.textContent = ":", a.appendChild(i)
        }
    }
    const t = () => {
        let e = Math.max(0, Math.floor((n - new Date) / 1e3));
        const o = Math.floor(e / 86400);
        e -= o * 86400;
        const i = Math.floor(e / 3600);
        e -= i * 3600;
        const d = Math.floor(e / 60);
        e -= d * 60;
        const u = s(o) + s(i) + s(d) + s(e);
        for (let l = 0; l < c.length; l++) c[l].textContent = u[l] ?? "0";
        n - new Date <= 0 && clearInterval(r)
    };
    t(), r = setInterval(t, 1e3)
}
const f = document.getElementById("player-count");
if (f) {
    const r = () => {
        f.textContent = 123e6 + Math.floor(Math.random() * 200001)
    };
    r(), setInterval(r, 5e3)
}