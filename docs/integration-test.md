# Blueprint — Tests d'intégration des endpoints API

## Objectif

Couvrir **l'intégralité des endpoints API actuellement en place** par des tests automatisés afin de prévenir toute régression, puis brancher l'exécution de la suite de tests dans le **pipeline de push** (pre-push Husky + CI GitHub Actions).

---

## 1. État des lieux

### 1.1 Endpoints existants

Endpoints authentifiés (admin) :

- `GET/POST /api/properties` — liste / création d'un bien
- `GET/PATCH/DELETE /api/properties/[id]` — lecture / édition / suppression
- `POST/DELETE /api/properties/[id]/images` — gestion des images
- `GET /api/properties/recent` — derniers biens
- `GET/POST /api/evaluations` — liste / création d'évaluation
- `GET/PATCH/DELETE /api/evaluations/[id]` — CRUD sur une évaluation
- `GET/PATCH /api/agency-settings` — paramètres agence
- `POST /api/labels/generate` — génération PDF étiquette
- `POST /api/labels/generate-preview` — preview étiquette
- `POST /api/labels/preview-energy` — preview DPE
- `POST /api/labels/upload-pdf` — upload PDF étiquette
- `POST /api/descriptive-sheets/upload-pdf` — upload PDF fiche descriptive
- `POST /api/upload/signed-url` — URL signée Supabase
- `GET /api/users` — liste utilisateurs
- `GET /api/debug` — debug interne
- `* /api/auth/[...nextauth]` — routes NextAuth

Endpoints publics (site vitrine / JSON consommé en externe) :

- `GET /api/public/properties` — liste publique
- `GET /api/public/properties/sale` — biens à la vente
- `GET /api/public/properties/rent` — biens à la location
- `GET /api/public/properties/recent` — derniers biens publics
- `GET /api/public/properties/[reference]` — détail par référence publique
- `GET /api/public/properties/[reference]/similar` — biens similaires
- `POST /api/public/evaluation` — soumission d'une demande d'évaluation

### 1.2 Outillage déjà en place

- **Vitest 4** + `jsdom`, config `vitest.config.ts` (`pool: 'forks'`, `isolate: true`).
- Setup global : `src/__tests__/setup.ts` (reset des mocks, env vars de test).
- Mocks utilitaires : `mocks/prisma.ts`, `mocks/auth.ts`, `mocks/supabase.ts`, `mocks/fixtures.ts`.
- Tests existants : `properties`, `properties/[id]`, `labels-generate`, `labels-preview-energy`, `labels-upload-pdf`.
- Husky : `pre-commit` → `npm run lint`, `pre-push` → `npm run build`.

### 1.3 Gap à combler

Tests manquants pour :

- `properties/[id]/images`, `properties/recent`
- `evaluations` (collection + détail)
- `agency-settings`
- `labels/generate-preview`
- `descriptive-sheets/upload-pdf`
- `upload/signed-url`
- `users`, `debug`
- `auth/[...nextauth]` (smoke test)
- **Toute la branche `public/*`** (7 endpoints)

Aucun test n'est actuellement exécuté automatiquement avant un push, ni en CI.

---

## 2. Périmètre et stratégie de test

### 2.1 Niveau de test

Tests **d'intégration au niveau route-handler** (pas d'HTTP réel) :

- Import direct des handlers (`GET`, `POST`, ...) depuis `@/app/api/.../route`.
- `Request` / `NextRequest` construits en mémoire.
- Prisma **mocké** via `mocks/prisma.ts`.
- Supabase **mocké** via `mocks/supabase.ts`.
- NextAuth session mockée via `mocks/auth.ts`.

Raison : cohérence avec la base existante, pas de dépendance DB/réseau en CI, exécution rapide (< 30s).

### 2.2 Cas couverts par endpoint

Pour chaque endpoint, au minimum :

1. **Happy path** — requête valide → status 2xx + shape de réponse attendue.
2. **Auth** — sur endpoints protégés : requête non authentifiée → 401.
3. **Validation** — payload invalide (Zod) → 400 avec message d'erreur.
4. **Not found** — ressource inexistante → 404 (routes `[id]` / `[reference]`).
5. **Erreur serveur** — Prisma reject → 500 sans fuite d'info sensible.

Pour les endpoints publics : vérifier explicitement qu'**aucune authentification n'est requise** et que la réponse **n'expose pas de champs privés** (ex : honoraires internes, notes, propriétaires).

### 2.3 Fixtures

Étendre `src/__tests__/mocks/fixtures.ts` avec :

- `mockEvaluation`, `mockCreateEvaluationBody`
- `mockAgencySettings`
- `mockUser`
- `mockPublicProperty` (shape publique attendue, sans champs sensibles)

---

## 3. Plan d'implémentation

### Étape 1 — Compléter les mocks et fixtures
- Ajouter les fixtures manquantes.
- Étendre `mocks/prisma.ts` avec les modèles non couverts (`evaluation`, `agencySettings`, `user`).
- Vérifier les mocks Supabase pour `storage.from().upload()`, `.createSignedUrl()`, `.remove()`.

### Étape 2 — Tests des endpoints admin manquants
Créer un fichier `.test.ts` par route, en suivant le pattern de `properties.test.ts` :
- `evaluations.test.ts`, `evaluations-id.test.ts`
- `properties-id-images.test.ts`
- `properties-recent.test.ts`
- `agency-settings.test.ts`
- `labels-generate-preview.test.ts`
- `descriptive-sheets-upload-pdf.test.ts`
- `upload-signed-url.test.ts`
- `users.test.ts`
- `debug.test.ts` (smoke)

### Étape 3 — Tests des endpoints publics
- `public-properties.test.ts`
- `public-properties-sale.test.ts`
- `public-properties-rent.test.ts`
- `public-properties-recent.test.ts`
- `public-properties-reference.test.ts`
- `public-properties-reference-similar.test.ts`
- `public-evaluation.test.ts`

Insister sur :
- Accès sans session.
- Filtrage des champs exposés (snapshot des clés de la réponse).
- Filtres de recherche (`?type=`, `?minPrice=`, etc. si présents).

### Étape 4 — Test smoke NextAuth
- Vérifier que le handler exporté répond sans crash (import uniquement, pas de flow OAuth complet).

### Étape 5 — Branchement pipeline
Modifier `.husky/pre-push` pour ajouter les tests **avant** le build :
```sh
npm run test:run
npm run build
```
Rationale : faire échouer tôt sur les régressions de logique avant de payer le coût du build Next.

### Étape 6 — CI GitHub Actions
Créer `.github/workflows/ci.yml` déclenché sur `push` et `pull_request` :

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
```

### Étape 7 — Couverture
- Objectif initial : **≥ 80 %** des fichiers `src/app/api/**/*.ts` (métrique `test:coverage`).
- Ajouter un job optionnel `npm run test:coverage` en CI sur la branche `main`.

---

## 4. Checklist d'exécution

- [ ] Étendre fixtures + mocks Prisma/Supabase
- [ ] Tests admin : evaluations (x2), images, recent, agency-settings, labels-generate-preview, descriptive-sheets, upload/signed-url, users, debug
- [ ] Tests publics : properties (x4), reference (x2), evaluation
- [ ] Smoke test NextAuth
- [ ] `.husky/pre-push` : exécuter `npm run test:run` avant `npm run build`
- [ ] `.github/workflows/ci.yml` : lint + test + build sur push/PR
- [ ] Vérifier `test:coverage` ≥ 80 % sur `src/app/api/**`
- [ ] Documenter dans le `README.md` la commande `npm run test:run`

---

## 5. Risques / points d'attention

- **Faux positifs dus aux mocks** : s'assurer que les mocks Prisma reflètent la forme réelle retournée (includes/relations). Utiliser `mockFullProperty` comme référence.
- **Endpoints avec `FormData` (upload PDF, images)** : construire des `FormData` réels dans les tests, ne pas mocker la requête elle-même.
- **Temps CI** : `next build` dans Husky peut être long localement ; prévoir éventuellement un flag `SKIP_BUILD_ON_PUSH` local si la friction devient un problème.
- **Endpoints publics** : toute régression sur la shape de réponse est une **breaking change** pour le site vitrine — envisager un test de snapshot sur les clés exposées.
