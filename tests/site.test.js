"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const html = fs.readFileSync("index.html", "utf8");
const script = fs.readFileSync("main.js", "utf8");
const nginx = fs.readFileSync("default.conf", "utf8");
const localAssets = [...html.matchAll(/(?:href|src)="\/([^"#?]+)"/g)].map((match) => match[1]);

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
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
    assert.match(html, /<button id="start-stream" type="button">/);
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
