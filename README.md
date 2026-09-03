# Craftyso

Modern storefront + ops dashboard for craftyso.co.il, replacing the legacy Folyou-hosted site.
Next.js (App Router) on Firebase (Firestore, Auth, Storage), Grow for payments.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Firebase web config + service account
npm run dev
```

### Firebase service account (required for the admin dashboard / server data)

Firebase Console → Project settings → Service accounts → Generate new private key, then set in
`.env.local`:

```
FIREBASE_PROJECT_ID=craftyso
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Create your first admin user

```bash
npm run create:admin -- you@example.com yourpassword
```

Then log in at `/admin/login`.

### Load some data

```bash
npm run seed:sample          # a few real sample products, for a quick demo
npm run scrape:catalog -- --category=iron-on-patches   # test one category
npm run scrape:catalog       # full migration from the live site
```

### Deploy security rules

```bash
firebase deploy --only firestore:rules,storage
```

## Structure

- `app/(store)/...` — public storefront (Hebrew/RTL)
- `app/admin/...` — internal dashboard (orders, leads, products, content, campaigns, social)
- `lib/firebase/` — client + admin SDK wiring, data queries
- `lib/grow/` — Grow payment gateway integration (pending real merchant credentials)
- `scripts/` — one-off migration/seeding scripts (not part of the deployed app)
