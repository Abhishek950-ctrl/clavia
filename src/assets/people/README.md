# Photos

Drop a headshot here named after the person, lower-case and hyphenated:

    roger-bennett.jpg
    priya-raman.jpg
    dan-whitfield.jpg
    ananya-rao.jpg
    sana-kaur.jpg
    marcus-hale.jpg
    yuki-tanaka.jpg

`.jpg`, `.png` and `.webp` all work — the build turns whatever is here into a
data: URI, so the single-file output stays single-file.

Then add the name to `PHOTOS` in `src/app.js`. Anyone not in that map keeps
the drawn face, so the two can coexist while the set fills up.

Square crops look best; anything else is centre-cropped by `object-fit`.
