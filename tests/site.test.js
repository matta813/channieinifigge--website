"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const html = fs.readFileSync("index.html", "utf8");
const script = fs.readFileSync("main.js", "utf8");
const nginx = fs.readFileSync("default.conf", "utf8");
const robots = fs.readFileSync("robots.txt", "utf8");
const sitemap = fs.readFileSync("sitemap.xml", "utf8");
const localAssets = [...html.matchAll(/(?:href|src)="\/([^"#?]+)"/g)].map((match) => match[1]);

test("YouTube is loaded only after explicit consent", () => {
    assert.match(html, /<button id="start-stream"/);
    assert.doesNotMatch(html, /youtube\.com|youtube-nocookie\.com/);
    assert.match(script, /startButton\.addEventListener\("click"/);
    assert.match(script, /youtube-nocookie\.com/);
});

test("failed YouTube loading can be retried", () => {
    assert.match(script, /tag\.onerror = showLoadError/);
    assert.match(script, /setTimeout\(showLoadError, 15000\)/);
    assert.match(script, /onError: showLoadError/);
    assert.match(script, /if \(!loadRequested\)/);
    assert.match(script, /startButton\.disabled = false/);
    assert.match(script, /startButton\.textContent = "Erneut versuchen"/);
    assert.match(html, /aria-describedby="status-message"/);
});

test("metadata and accessible page structure are present", () => {
    assert.match(html, /<html lang="de">/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<main>/);
    assert.match(html, /<h1 class="visually-hidden">/);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
    assert.match(html, /<button id="start-stream" type="button"[^>]*>/);
    assert.match(html, /aria-live="polite"/);
});

test("all local assets exist and identifiers are unique", () => {
    assert.ok(localAssets.length > 0);
    for (const asset of localAssets) {
        assert.ok(fs.existsSync(asset), `missing local asset: ${asset}`);
    }
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(ids.length, new Set(ids).size);
});

test("SEO and social metadata use the production domain", () => {
    assert.match(html, /rel="canonical" href="https:\/\/channieinifigge\.uk\/"/);
    assert.match(html, /property="og:url" content="https:\/\/channieinifigge\.uk\/"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.match(html, /https:\/\/channieinifigge\.uk\/social-preview\.png/);
    assert.match(robots, /Sitemap: https:\/\/channieinifigge\.uk\/sitemap\.xml/);
    assert.match(sitemap, /<loc>https:\/\/channieinifigge\.uk\/<\/loc>/);
});

test("social preview has standard link-preview dimensions", () => {
    const preview = fs.readFileSync("social-preview.png");
    assert.deepEqual(preview.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    assert.equal(preview.readUInt32BE(16), 1200);
    assert.equal(preview.readUInt32BE(20), 630);
    assert.ok(preview.length < 500_000);
    assert.match(fs.readFileSync("Dockerfile", "utf8"), /COPY social-preview\.png/);
    assert.match(fs.readFileSync("Dockerfile", "utf8"), /COPY sitemap\.xml/);
});

test("scripts remain external and the privacy-preserving embed is enforced", () => {
    assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>\s*\S/);
    assert.doesNotMatch(script, /youtube\.com\/embed/);
    assert.match(script, /host: "https:\/\/www\.youtube-nocookie\.com"/);
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
    assert.match(nginx, /server_tokens off/);
    assert.match(nginx, /object-src 'none'/);
    assert.match(nginx, /form-action 'none'/);
});
