Drop logos, marks and images here.

Reference them from src/index.html as `assets/name.svg` or from src/styles.css
as `url(assets/name.svg)`. `node build.mjs` inlines each one as a data: URI, so
dist/artifact.html stays a single self-contained file with no external requests.

SVG is preferred for logos and marks — it inlines to a fraction of the size of
a PNG at the same fidelity.
