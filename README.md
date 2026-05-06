# Cabinet Rimbault - Agence Immobilière

Application web pour la gestion d'une agence immobilière avec interface d'administration et API publique pour le site vitrine.

## Fonctionnalités

### Admin

- ✅ Authentification sécurisée (NextAuth, JWT)
- ✅ Tableau de bord avec statistiques (annonces, leads, estimations)
- ✅ Gestion des annonces immobilières (CRUD complet)
- ✅ Gestion des leads / demandes de contact (liste, détail, statut, notes)
- ✅ Gestion des demandes d'estimation (liste, détail, statut, notes)
- ✅ Notifications dynamiques (badge compteur dans le header)
- ✅ Dashboard enrichi : stats leads/estimations + section "Dernières demandes"
- ✅ Génération d'étiquettes vitrine (PDF)
- ✅ Génération automatique des étiquettes DPE/GES (SVG → image → Supabase Storage)
- ✅ Fiches descriptives (PDF)
- ✅ Paramètres agence (singleton `AgencySettings`)

### API publique (pour le site vitrine)

- ✅ `GET /api/public/properties` — liste des biens publiés (filtres, pagination)
- ✅ `GET /api/public/properties/[id]` — détail d'un bien (sans champs sensibles)
- ✅ `POST /api/public/contact` — formulaire de contact (création Lead + email de confirmation)
- ✅ `POST /api/public/evaluation` — demande d'estimation (création Evaluation + email de confirmation)
- ✅ `GET /api/properties/recent` — biens récents (public, sans API key)

### Emails transactionnels (Resend)

- ✅ Email de confirmation automatique après une demande de contact
- ✅ Email de confirmation automatique après une demande d'estimation
- ✅ Envoi fire-and-forget (ne bloque pas la réponse API)
- ✅ Templates HTML professionnels avec coordonnées agence et mentions RGPD

## Technologies

- **Framework** : Next.js 15 (App Router) + React 19
- **Styling** : Tailwind CSS + shadcn/ui (new-york style)
- **Base de données** : PostgreSQL (via Docker, port 5436)
- **ORM** : Prisma
- **Auth** : NextAuth.js (JWT + credentials)
- **Formulaires** : React Hook Form + Zod
- **Emails** : Resend (SDK TypeScript)
- **Stockage fichiers** : Supabase Storage
- **Tests** : Vitest + jsdom
- **CI** : GitHub Actions (lint → test → build)

## Installation

### Prérequis

- Node.js 18+
- Docker & Docker Compose
- npm

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Lancer la base de données

```bash
docker-compose up -d
```

### 3. Configurer l'environnement

Copier `.env.example` vers `.env.local` et renseigner les valeurs :

```bash
# --- Base de données ---
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/cabinet_rimbault?schema=public"

# --- Auth ---
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# --- Supabase Storage (images, DPE/GES, PDFs) ---
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# --- API publique ---
PUBLIC_API_KEY="your-public-api-key"         # X-API-Key pour les endpoints /api/public/*
ADMIN_API_TOKEN="your-admin-api-token"       # Bearer token pour /api/users

# --- Emails (optionnel) ---
RESEND_API_KEY="re_xxxxxxxxxxxx"             # Clé API Resend (https://resend.com)
AGENCY_EMAIL_FROM="noreply@cabinet-rimbault.fr"  # Adresse expéditeur vérifiée sur Resend
```

> **Note** : Sans `RESEND_API_KEY`, les emails de confirmation ne sont pas envoyés mais l'API fonctionne normalement. La `SUPABASE_SERVICE_ROLE_KEY` permet de bypass les RLS policies pour les uploads côté serveur — ne jamais l'exposer côté client.

### 4. Initialiser la base de données

```bash
npm run db:push
npm run db:seed
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

## Accès Admin

Après le seed, connectez-vous :

- **URL** : http://localhost:3000/login
- **Email** : admin@cabinet-rimbault.fr
- **Mot de passe** : admin123

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Compile l'application (prisma generate + next build) |
| `npm run start` | Lance en production |
| `npm run lint` | ESLint |
| `npm run test` | Tests en mode watch |
| `npm run test:run` | Tests une seule fois (CI + pre-push) |
| `npm run db:push` | Synchronise le schéma Prisma vers la DB |
| `npm run db:seed` | Seed avec données de test |
| `npm run db:reset` | Reset DB + re-seed |
| `npm run db:studio` | Prisma Studio GUI |

## Tests

27 fichiers de tests, 250 tests couvrant tous les endpoints API (admin + publics) au niveau route-handler avec Prisma, Supabase, NextAuth et Resend mockés.

```
src/__tests__/
├── mocks/
│   ├── prisma.ts           # Mock Prisma client
│   ├── auth.ts             # Mock NextAuth (setAuthenticated)
│   ├── api-public-auth.ts  # Mock API key auth (setPublicApiAuth)
│   ├── supabase.ts         # Mock Supabase Storage
│   ├── resend.ts           # Mock Resend emails (resetResendMocks)
│   └── fixtures.ts         # Données de test partagées
└── api/
    ├── properties.test.ts
    ├── properties-id.test.ts
    ├── evaluations.test.ts
    ├── evaluations-id.test.ts
    ├── leads.test.ts
    ├── leads-id.test.ts
    ├── notifications-count.test.ts
    ├── public-contact.test.ts
    ├── public-evaluation.test.ts
    └── ...
```

Exécution automatique :
- **pre-commit** : `npm run lint` (via Husky)
- **pre-push** : `npm run test:run` puis `npm run build`
- **CI** : `.github/workflows/ci.yml` (lint → test:run → build)

## Structure du projet

```
src/
├── app/
│   ├── (authenticated)/          # Route group — pages admin protégées
│   │   ├── dashboard/            # Tableau de bord (stats, dernières demandes)
│   │   ├── properties/           # Gestion des annonces
│   │   ├── estimations/          # Demandes d'estimation (liste + détail)
│   │   ├── leads/                # Leads / contacts (liste + détail)
│   │   ├── labels/               # Étiquettes vitrine
│   │   ├── descriptive-sheets/   # Fiches descriptives
│   │   └── settings/             # Paramètres agence
│   ├── api/
│   │   ├── auth/                 # NextAuth
│   │   ├── properties/           # CRUD annonces (admin)
│   │   ├── evaluations/          # CRUD estimations (admin)
│   │   ├── leads/                # CRUD leads (admin)
│   │   ├── notifications/count/  # Compteur notifications (admin)
│   │   ├── labels/               # Génération étiquettes DPE/GES
│   │   └── public/               # API publique (X-API-Key)
│   │       ├── contact/          # POST — création lead + email
│   │       ├── evaluation/       # POST — création estimation + email
│   │       └── properties/       # GET — biens publiés
│   └── login/                    # Page de connexion
├── components/
│   ├── admin/                    # Sidebar, Header, composants admin
│   ├── ui/                       # shadcn/ui
│   └── providers/                # Providers React
├── lib/
│   ├── prisma.ts                 # Client Prisma (singleton)
│   ├── resend.ts                 # Client Resend (lazy proxy)
│   ├── supabase.ts               # Clients Supabase (public + admin)
│   ├── api-auth.ts               # requireAuth() — auth admin
│   ├── api-public-auth.ts        # requirePublicApiKey() — auth API publique
│   ├── emails/                   # Templates email HTML
│   │   ├── contact-confirmation.tsx
│   │   └── evaluation-confirmation.tsx
│   └── energy-labels/            # Génération étiquettes DPE/GES (SVG)
└── __tests__/                    # Tests Vitest
```

## Modèle de données (Prisma)

| Modèle | Description |
|--------|-------------|
| `User` | Utilisateurs admin (agents) |
| `Property` | Biens immobiliers (+ 6 sous-tables 1:1 + 4 collections 1:N) |
| `Evaluation` | Demandes d'estimation depuis le site vitrine |
| `Lead` | Demandes de contact depuis le site vitrine |
| `AgencySettings` | Paramètres agence (singleton, id="default") |

Tous les enums sont en français (`VENTE`, `DISPONIBLE`, `NOUVEAU`, etc.).

## Variables d'environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL |
| `NEXTAUTH_SECRET` | ✅ | Clé secrète NextAuth |
| `NEXTAUTH_URL` | ✅ | URL de l'application |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clé anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key Supabase (serveur uniquement) |
| `PUBLIC_API_KEY` | ✅ | Clé API pour les endpoints `/api/public/*` |
| `ADMIN_API_TOKEN` | ✅ | Bearer token pour `/api/users` |
| `RESEND_API_KEY` | ❌ | Clé API Resend (emails de confirmation) |
| `AGENCY_EMAIL_FROM` | ❌ | Adresse expéditeur vérifiée sur Resend |

## Configuration Resend (emails)

Pour activer l'envoi d'emails de confirmation :

1. Créer un compte sur [resend.com](https://resend.com)
2. Vérifier un domaine d'envoi (ex: `cabinet-rimbault.fr`)
3. Récupérer la clé API et la renseigner dans `RESEND_API_KEY`
4. Configurer `AGENCY_EMAIL_FROM` avec l'adresse vérifiée (ex: `noreply@cabinet-rimbault.fr`)

Les emails sont envoyés en fire-and-forget : un échec d'envoi est loggé mais ne bloque jamais la réponse API.
