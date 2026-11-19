# Rehab Physiotherapy Website 2

Static single-page site for a physiotherapy clinic ("Motus Physiotherapy", HSR Layout, Bengaluru — placeholder brand, address, phone and prices).

## Run
Double-click `index.html`, or serve the folder: `npx serve .` / `python -m http.server 8080`

## Design
- 60-30-10 colour: 60% mist `#efedf5` (+ white), 30% plum `#2b1838`, 10% lime `#c8f04a` (CTAs and active states only)
- Type: Unbounded (headings) + DM Sans (body), self-hosted in `assets/fonts/`
- Animations: hero headline mask-rise on load; hero photo widens on scroll; conditions marquee; sticky stacked treatment cards that shrink as the next arrives; photo wipe-reveals; recovery timeline that fills as you scroll; FAQ accordion. All respect "reduce motion".

## Files
- `index.html`, `css/styles.css`, `js/main.js`
- `assets/img/` – 13 photos (800w + 1600w WebP) + video poster
- `assets/video/spine-model-session.mp4` – one 10 s muted clip, loads only when scrolled into view

## Media credits (free for commercial use)
- Photos: Pexels contributors (IDs 20860621, 4506160, 6094334, 13185359, 4506074, 8769176, 30483062, 29807423, 5793713, 6111589, 20860585, 20860610, 4506073)
- Video: Mixkit #18267

## Before going live
- Replace brand, address, phone/WhatsApp, prices and hours with the client's real details
- Connect the booking form (currently validates and shows a confirmation only)
