"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const html = fs.readFileSync("index.html", "utf8");
const script = fs.readFileSync("main.js", "utf8");
const nginx = fs.readFileSync("default.conf", "utf8");

test("YouTube is loaded only after explicit consent", () => {
    assert.match(html, /<button id="start-stream"/);
    assert.doesNotMatch(html, /youtube\.com|youtube-nocookie\.com/);
    assert.match(script, /startButton\.addEventListener\("click"/);
    assert.match(script, /youtube-nocookie\.com/);
});

test("metadata and accessible page structure are present", () => {
    assert.match(html, /<html lang="de">/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<main>/);
    assert.match(html, /<h1 class="visually-hidden">/);
});

test("nginx sends security and cache headers", () => {
    for (const header of [
        "Content-Security-Policy",
        "Cross-Origin-Opener-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options"
    ]) {
        assert.match(nginx, new RegExp(`add_header ${header}`));
    }
    assert.match(nginx, /youtube-nocookie\.com/);
    assert.match(nginx, /expires 1h/);
});
