# Tsongra — ཚོང་ར་ · Ladakh Local Market

A marketplace for Ladakh's own produce: fruit, vegetables, grain, dairy and seed,
traded **direct between neighbours**. No commission, no wallet, no middleman.

*Tsongra* is the Ladakhi/Bhoti word for a marketplace.

**▶ Try it: https://shoiabgoku.github.io/phropa-/**

---

## Two ways it runs

The same code runs in two modes and every screen is identical in both. The app
works out which one it is in with a single request at startup.

| Mode | What's behind it | What it is |
|---|---|---|
| **Server** | Node + SQLite (`node server.js`) | A real marketplace. Many people, shared data, real chat between them. |
| **Local** | Nothing at all — browser storage | The GitHub Pages demo. Everything works, but the data lives in that one browser and reaches nobody else. |

The live link above is **local mode**, because GitHub Pages can only serve static
files — it cannot run Node. A two-sided handshake cannot honestly be shown by one
person alone, so the demo has a **persona switcher** (🎭, bottom right): agree a
deal as the buyer, become the seller, agree again, and watch the phone numbers
unlock. Reset the demo data from the same menu.

For a real deployment with real users, run it in server mode.

---

## The one rule the app is built around

**Tsongra never touches money.**

Buyer and seller negotiate in the app's chat. When — and only when — **both sides
tap "Agree the deal"** on the same terms, the app unlocks their phone numbers to
each other and produces a deal card (item, quantity, rate, delivery, total).
Payment happens between the two of them: cash, UPI, bank transfer, whatever they
trust. The app has no wallet, no gateway and takes no cut.

That handshake is the whole trust model, so it lives in one place
([`lib/api.js`](lib/api.js), `POST /api/threads/:id/deal`) and is covered by tests:

- A phone number is `null` in every API response until `deal_at` is set.
- Setting `deal_at` requires `buyer_ok AND seller_ok`.
- **Changing any term resets both agreements** and re-hides the numbers, so nobody
  is ever bound — or exposed — by a term they did not see.

---

## What's in it

| | |
|---|---|
| **Bazaar** | Seven picture-led categories, search (including voice search), filters for "delivers to me" and organic. |
| **Sell** | Four steps and almost no typing: pick your crop from an icon grid → price and quantity → photo → delivery. |
| **Delivery** | A merchant flips one switch, ticks the districts they cover, sets a charge and a free-above amount. Every listing they own instantly shows a **Delivers** badge to buyers inside that area — and stops showing it the moment they switch off. |
| **Chat** | Quick-reply chips in the local language, structured **price offers**, and the deal handshake above. |
| **Seed Bank** | 24 crops suited to Ladakh's cold desert — including ones almost nobody here grows yet — with sowing windows per altitude zone, and a month-grid sowing calendar. |
| **Rate board** | Community-reported market prices with a median and a 14-day trend, so a farmer knows what their crop is actually worth before they bargain. |
| **Wanted** | Buyers post what they need; growers see the demand. |
| **Notices** | Department schemes, GI-grading tips, fraud warnings. |
| **Offline** | Installable PWA. The app shell and the **entire Seed Bank** work with no signal at all. |

### Why the Seed Bank exists

Ladakh grows a narrow set of crops, and several things that would do very well
here are barely planted. The Seed Bank is the awareness half of the app. Each
entry answers, in order: *why does this work at this altitude*, *when do I sow it
in my zone*, *what will it yield*, *what does it sell for*, *what goes wrong*, and
*where do I get seed*. Entries are tagged:

- **Grown here for centuries** — traditional crops now being dropped (naked barley/*nas*, turnip/*nyungma*, bitter buckwheat/*trumba*, broad bean/*bakla*).
- **New for Ladakh** — proven here but rarely planted (quinoa, Siberian kale, pak choi, Swiss chard, broccoli, fodder beet, seed potato, cherry tomato, sea buckthorn as an orchard crop).
- **High value, needs patience** — asparagus, strawberry, hops, rhodiola.

Sowing dates are given per altitude zone, because a Turtuk field and a Korzok
field are not the same country:

| Zone | Altitude | Season |
|---|---|---|
| Low valleys | 2,600–3,200 m | late March → October |
| Leh belt | 3,200–3,600 m | April → early October |
| High plateau | 3,600–4,300 m | mid-May → September |
| Greenhouse / trench | any | all year |

---

## Running it

Needs **Node 22.5+** (uses the built-in `node:sqlite`). There are **no npm
dependencies at all** — nothing to install, nothing to keep patched.

```bash
node server.js
```

Then open `http://localhost:8787`.

To load demo content (8 Ladakhi accounts across all seven districts, 20 listings,
price reports, wanted posts):

```bash
node seed-demo.js
```

Every demo account uses **PIN 1234**. Try `9000000001` (Tsering Dolma, a
Choglamsar greenhouse grower who delivers into Leh).

Data lives in `data/tsongra.db`. Delete it to start clean.
`PORT` and `TSONGRA_DB` are both overridable by environment variable.

The catalogue lives in `public/` rather than `lib/` on purpose: the Node server
and the browser-only build import the very same file, so the crop data and Seed
Bank can never drift between them.

### Publishing the static demo

`public/` is a complete, self-contained app. Push it as the Pages branch:

```bash
git subtree push --prefix public origin gh-pages
```

Then set Pages to serve from `gh-pages` / root.

### Deploying

Any host that runs a Node process and keeps a writable disk works — Render, Fly,
a VPS, or a machine in Leh. Put it behind HTTPS (the session cookie is
`HttpOnly; SameSite=Lax`, and phone cameras will not open on plain HTTP).
Back up `data/tsongra.db`; that single file is the whole marketplace.

---

## Design notes

**It is built for the phone and the network people actually have.** Vanilla
JS, no framework, no bundler, no web fonts. Photos are downscaled in the browser
to roughly 60–120 KB before they are ever uploaded. Chat uses polling rather than
a websocket, because on a village tower a dropped socket is far more likely than
a dropped request and polling reconnects for free.

**It is built to be used by people who do not read much.** Every category and
crop is an icon first. Selling requires picking pictures, two numbers and a
photo. Long-press a category to hear it spoken. Search takes voice input.

**Ladakhi visual language.** Apricot (*chuli*) as the primary colour, monastery
maroon, Pangong turquoise, mud-plaster sand; a five-colour prayer-flag ribbon
under every header, a chorten mark, and a mountain silhouette behind the home
header.

**Four languages, because Ladakh needs four.** English, Hindi, Ladakhi
(romanised) and Urdu, the last right-to-left. The whole stylesheet uses CSS
logical properties, so RTL mirrors correctly without a second sheet, and every
text element carries `dir="auto"` so English notes inside an Urdu page keep their
punctuation in the right place.

Ladakhi is written in **roman script, not Bhoti** — Bhoti renders as empty boxes
on many Android phones, and romanised Ladakhi is what people actually type.
The strings deliberately keep the English loanwords Ladakhi speech really uses
rather than inventing purist coinages.

---

## Before this goes to a real village

These are honest gaps, not oversights:

1. **Get the Ladakhi and Urdu strings read by native speakers** — one from Leh,
   one from Kargil. They are careful best-effort, not authoritative. Everything
   is in [`public/i18n.js`](public/i18n.js) and [`lib/names.js`](lib/names.js).
2. **The Seed Bank's long-form agronomy text is English only.** Names, sowing
   windows, badges and all UI chrome are translated; the *why / care / yield*
   prose is not. This was deliberate — machine-guessing agronomic advice into a
   language convincingly enough to be acted on is worse than leaving it in
   English. It needs a translator working with KVK or DIHAR.
3. **Have the agronomy reviewed by KVK Leh / KVK Kargil / DIHAR.** The sowing
   windows and yields in [`lib/catalogue.js`](lib/catalogue.js) come from
   published sources and are sound as guidance, but a local expert should sign
   off before farmers plant on them.
4. **Login is phone + PIN, with no SMS verification**, because there is no SMS
   gateway wired up. Anyone can register any number. Before real use, add OTP
   verification — otherwise someone can register a number that is not theirs and
   receive a stranger's deal calls.
5. **There is no admin console.** Reports land in the `reports` table and notices
   are inserted directly into `notices`. Both need a screen before someone other
   than a developer can moderate.
6. **Rate-limiting.** Nothing throttles signup, listing creation or price
   reports yet. Add a limiter before opening it to the public internet.

---

## Layout

```
server.js            HTTP, routing, static files    (no dependencies)
lib/db.js            SQLite schema (node:sqlite)
lib/api.js           every endpoint; the deal handshake lives here
public/catalogue.js  crops, seed bank, altitude zones, the 7 districts
public/names.js      Hindi + Urdu names for categories, crops, seeds
public/local-api.js  the same endpoints with no server, for the static demo
public/app.js        boot, router, bottom nav
public/views.js      every screen
public/ui.js         DOM helpers, image downscaling, bidi handling
public/store.js      state, API client, mode detection, offline caching
public/i18n.js       the four languages
public/sw.js         offline shell; caches the Seed Bank hard
seed-demo.js         demo content
```

Ladakh's seven districts (Leh, Kargil, Nubra, Sham, Changthang, Zanskar, Drass)
reflect the reorganisation notified on 27 April 2026.

---

*Julley.* 🙏
