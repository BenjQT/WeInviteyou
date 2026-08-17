# JhonJhon & Juliet — digital wedding invitation

A single-page invitation implemented from the Claude Design project
*Digital wedding invitation design* (`Wedding Invitation.dc.html`).

Plain HTML, CSS and JavaScript — no build step, no dependencies. Drop the folder
on any static host (Netlify, Vercel, GitHub Pages, cPanel) and it works.

```
index.html      structure and copy
styles.css      theme tokens, layout, animation
script.js       countdown, theme toggle, music, gate, film, RSVP
uploads/        photos, the film, the marble backdrop, the J/J emblem
favicon.ico     J/J emblem, 16/32/48px — plus the .png variants beside it
```

The favicons are generated from the emblem artwork: `favicon.ico` for the tab,
`favicon-16.png` / `favicon-32.png` for modern browsers, and
`apple-touch-icon.png` at 180px on a solid `#0f221b` tile, since iOS composites
home-screen icons over its own background rather than honouring transparency.

## Sections

Hero → Music → The Big Day → Timeline → Our Moments → RSVP → Finer Details →
Thank You.

**Finer Details** is the last content section before the closing Thank You, and
carries three blocks: Attire Guide (the dress code — type, swatches and note),
Gift Guide, and Snap & Share with the hashtag. Copy is plain text in
`index.html`; add another block by copying a `.finer__block` and the `<hr>`
above it.

## Media

| File | Where it appears | Crop focus |
| --- | --- | --- |
| `uploads/photo-1.jpg` | Hero arch + gallery square | `object-position: 14% 35%` — couple sits left of centre |
| `uploads/photo-2.jpg` | Tall gallery frame | `object-position: 72% 60%` |
| `uploads/photo-4.jpg` | Second gallery square (the bench) | Pre-cropped square, held centred |
| `uploads/photo-3.jpg` | Wide gallery frame (aerial) | `object-position: center 48%` |
| `uploads/couple-garden.mp4` | The film, full width below the photos | 16:9 |

To swap in different photos, overwrite those files. If the framing then sits
awkwardly, adjust `object-position` on `.photo--arch img`, `.photo--square img`,
`.photo--tall img` or `.photo--wide img` in `styles.css` — the first number pans
horizontally, the second vertically.

If a photo is ever missing, its frame falls back to a gold "J / J" panel rather
than a broken image, so the page still looks finished.

The aerial shot is re-encoded to 1400px wide at quality 78 (390 KB, down from
4.5 MB), and the bench photo cropped to a 1000×1000 square at quality 80
(176 KB, down from 3.3 MB) — worth repeating for any photo you add, since guests
open this on mobile data.

The bench photo was cropped rather than panned because the original is a wide
4:3 frame: dropped into a small square tile untouched, the couple would have
been a speck in a lot of church. The crop is a 1300px square taken at (340, 492)
of the 2400×1792 original, so re-cropping from the original is repeatable.

### The film

The video tile is click-to-play and stays **muted and looping** so it never
fights the song. The `#t=0.6` fragment on its `src` makes the browser paint a
real frame of the film as its own still, so the tile is never black before a
guest taps play — there is no separate poster image to keep in sync.

### Full wedding video

`moriweddinginvitation/` holds a 267 MB MP4 and an MP3. Both are git-ignored and
are not part of the site. The MP4 is past GitHub's 100 MB per-file hard limit,
and serving a file that size from a static host would be slow and expensive for
guests on mobile data. To put the full video on the invitation, upload it to
YouTube or Vimeo and embed it, or export a compressed web cut (1080p, ~8 Mbps,
under ~25 MB) into `uploads/` and point the film tile at it.

## Settings

Everything configurable sits in the `CONFIG` block at the top of `script.js`:

| Key | Purpose |
| --- | --- |
| `weddingDate` | Countdown target — `2026-11-28T13:00:00+08:00` (Philippine time) |
| `videoId` | YouTube id used as the background track |
| `volume` | Playback volume, 0–100 |
| `formEndpoint` | Formspree endpoint that receives RSVPs |
| `timeline` | The day's schedule |

Names, venues, attire, gift and hashtag copy, and the RSVP deadline are plain
text in `index.html`.

### RSVP delivery

RSVPs POST as JSON to Formspree (`https://formspree.io/f/xzepjjwo`) with the
guest's name, headcount, and the wedding label. Sign in to Formspree to see
submissions, or swap in your own form id. The first submission from a new form
needs a one-time email confirmation before entries come through.

### Music

The track autoplays muted (every browser requires this), then unmutes the moment
a guest taps **OPEN INVITATION** — that tap is the gesture browsers ask for. The
floating ♪ button and the "Our Song" card both toggle it.

### Motion

The monogram spin, gold shimmer and entrance fades stop when the guest's device
has "reduce motion" turned on (Windows: Settings → Accessibility → Visual
effects → Animation effects). Everything is styled to look composed at rest, so
nothing appears broken.

The equaliser bars are the one exemption — they keep bouncing regardless,
because they are a status indicator rather than decoration: they are how a guest
tells the music is playing. They still settle into staggered resting heights
when the track is paused. The monogram's gold shimmer is exempt for the same
reason — contained motion that stays inside its own box. Both exemptions are the
`:not()` clauses in the `prefers-reduced-motion` block in `styles.css`.

Gallery tiles lift on hover: a gold hairline ring and a slow 1.055× zoom on the
image inside. The hero arch is deliberately excluded so it keeps its still,
framed look.

### Theme

Dark is the default. The ☾/☀ button swaps to the ivory palette and remembers the
choice in `localStorage`.

## Running locally

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>. A server is needed rather than opening the
file directly, otherwise the YouTube player and the RSVP request are blocked.
