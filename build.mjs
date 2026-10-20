#!/usr/bin/env node
/**
 * Inlines src/index.html + its local <link>/<script> into one self-contained file.
 *
 *   dist/app.html       full standalone page — open locally, share as a file
 *   dist/index.html     the same file under the name a static host serves
 *   dist/artifact.html  same page minus doctype/html/head/body — for the Artifact tool,
 *                       which supplies that skeleton itself
 *
 * Zero dependencies. Run: node build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

await import('./sprite.mjs');   // keep src/sprite.html in step with src/assets

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');

const read = f => readFileSync(join(src, f), 'utf8');
const isLocal = href => href && !/^(https?:)?\/\//.test(href) && !href.startsWith('data:');

/* ---- assets -> data: URIs ------------------------------------- */

const MIME = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.woff': 'font/woff',
};

const dataUri = ref => {
  const clean = ref.split('?')[0].split('#')[0];
  const file = join(src, clean);
  if (!existsSync(file)) {
    console.warn(`  ! missing asset: ${clean}`);
    return null;
  }
  const ext = clean.slice(clean.lastIndexOf('.')).toLowerCase();
  const mime = MIME[ext];
  if (!mime) {
    console.warn(`  ! unknown asset type: ${clean}`);
    return null;
  }
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
};

/**
 * Any quoted `assets/…` path becomes a data: URI — in markup attributes, in
 * CSS url(), and in JS string literals, since a path can be written in any of
 * the three. The prefix is specific enough that a quoted match is never a
 * false positive here.
 */
const inlineAssets = text => text
  .replace(/(["'])(assets\/[^"']+)\1/g, (m, q, ref) => {
    const uri = dataUri(ref);
    return uri ? `${q}${uri}${q}` : m;
  })
  .replace(/url\(\s*["']?(assets\/[^"')]+)["']?\s*\)/gi, (m, ref) => {
    const uri = dataUri(ref);
    return uri ? `url("${uri}")` : m;
  });

let html = read('index.html');

// <!--include:file.html--> -> the file's contents
html = html.replace(/<!--include:([^\s>]+?)-->/g, (m, f) => read(f).trim());

// <link rel="stylesheet" href="x.css">  ->  <style>…</style>
html = html.replace(
  /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi,
  tag => {
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1];
    if (!isLocal(href)) return tag;
    return `<style>\n${inlineAssets(read(href)).trim()}\n</style>`;
  }
);

// <script src="x.js"></script>  ->  <script>…</script>
html = html.replace(
  /<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi,
  (tag, pre, src_, post) => {
    if (!isLocal(src_)) return tag;
    const attrs = (pre + post).replace(/\btype=["']module["']/i, '').trim();
    return `<script${attrs ? ' ' + attrs : ''}>\n${read(src_).trim()}\n</script>`;
  }
);

html = inlineAssets(html);

mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'app.html'), html);
/* the same bytes under the name a static host looks for, so `vercel deploy`
   can be pointed straight at dist/ with nothing else to configure */
writeFileSync(join(dist, 'index.html'), html);
/* Same app at its own address, with the first-run card on the home screen —
   a link to hand to somebody who has never opened this before. */
writeFileSync(join(dist, 'welcome.html'), html.replace('<body', '<body data-firstrun="true"'));
/* The access-request email as its own address — it is what lands in the
   owner's inbox, not a screen inside the app. */
writeFileSync(join(dist, 'access-email.html'), html.replace('<body', '<body data-view="email"'));
/* and the wall the request is made from, on an address of its own */
writeFileSync(join(dist, 'request-access.html'), html.replace('<body', '<body data-view="access"'));
/* and the link that leads nowhere */
writeFileSync(join(dist, 'not-found.html'), html.replace('<body', '<body data-view="404"'));
/* a connector's setup page at an address of its own, to send to an admin */
writeFileSync(join(dist, 'connect-bigquery.html'),
  html.replace('<body', '<body data-connect="bigquery"')
      .replace(/<title>[\s\S]*?<\/title>/i, '<title>Connect BigQuery · UnifyApps</title>'));
writeFileSync(join(dist, 'connect-snowflake.html'),
  html.replace('<body', '<body data-connect="snowflake"')
      .replace(/<title>[\s\S]*?<\/title>/i, '<title>Connect Snowflake · UnifyApps</title>'));

// Artifact variant: strip the skeleton the publisher adds, hoist <head> contents.
const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [, ''])[1];
const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [, html])[1];
const keep = head
  .replace(/<meta\b[^>]*charset[^>]*>/gi, '')
  .replace(/<meta\b[^>]*name=["']viewport["'][^>]*>/gi, '')
  .trim();

/* The app's own tab says "UnifyApps" — right inside the product, useless in
   a gallery that already holds UnifyApps Home, Onboarding and Artifacts. The
   published copy gets a name that identifies it there. */
const named = keep.replace(/<title>[\s\S]*?<\/title>/i, '<title>Assistant Workspace</title>');

writeFileSync(join(dist, 'artifact.html'), `${named}\n${body}`.trim() + '\n');

/* ---- the desktop shell -------------------------------------------
   The Mac window is the same app inside a chrome of its own, and it
   iframes a copy rather than importing one. Deployed it needs two
   things changed: the app it points at, and its own assets, which live
   beside it rather than under src/. Both are inlined here so the shell
   ships as one file like everything else. */
const deskDir = join(root, '..', 'desktop');
if (existsSync(join(deskDir, 'index.html'))) {
  let desk = readFileSync(join(deskDir, 'index.html'), 'utf8');
  desk = desk.replace(/const APP_SRC = '[^']*'/, "const APP_SRC = 'app.html'");
  desk = desk.replace(/(["'])(assets\/[^"']+)\1/g, (m, q, ref) => {
    const file = join(deskDir, ref.split('?')[0]);
    if (!existsSync(file)) { console.warn(`  ! missing desktop asset: ${ref}`); return m; }
    const ext = ref.slice(ref.lastIndexOf('.')).toLowerCase();
    const mime = MIME[ext];
    if (!mime) return m;
    return `${q}data:${mime};base64,${readFileSync(file).toString('base64')}${q}`;
  });
  writeFileSync(join(dist, 'desktop.html'), desk);
  console.log(`dist/desktop.html   ${(Buffer.byteLength(desk) / 1024).toFixed(1)} KB`);
}

/* ---- the deck ------------------------------------------------------
   Written as an Artifact, which supplies the page skeleton itself. On a
   host of our own it needs that skeleton back, and nothing else. */
const deckSrc = join(root, 'deck', 'ai-meetings.html');
if (existsSync(deckSrc)) {
  const inner = readFileSync(deckSrc, 'utf8');
  const page = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    + '<style>html,body{margin:0;padding:0}</style>\n'
    + inner.replace(/<div class="deck"[\s\S]*$/, '') + '</head>\n<body>\n'
    + (inner.match(/<div class="deck"[\s\S]*$/) || [''])[0] + '\n</body>\n</html>\n';
  writeFileSync(join(dist, 'deck.html'), page);
  console.log(`dist/deck.html      ${(Buffer.byteLength(page) / 1024).toFixed(1)} KB`);
}

/* ---- the self-playing demo ----------------------------------------
   Drives the real app in a frame on a fixed timeline, with the
   narration as captions. Deployed it points at the built pages rather
   than the dev-server ones. */
const demoSrc = join(src, 'demo.html');
if (existsSync(demoSrc)) {
  const demo = readFileSync(demoSrc, 'utf8')
    .replace("const DECK_SRC = '_deck.html'", "const DECK_SRC = 'deck.html'")
    .replace("const APP_SRC  = 'index.html'", "const APP_SRC  = 'app.html'");
  writeFileSync(join(dist, 'demo.html'), demo);
  console.log(`dist/demo.html      ${(Buffer.byteLength(demo) / 1024).toFixed(1)} KB`);
}

const kb = s => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log(`dist/app.html       ${kb(html)}   (also index, welcome, access-email, request-access, not-found)`);
console.log(`dist/artifact.html  ${kb(named + body)}`);
