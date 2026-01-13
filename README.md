# Cabinet Rimbault - Agence Immobilière

Application web pour la gestion d'une agence immobilière avec interface d'administration.

## Fonctionnalités

### Admin
- ✅ Authentification sécurisée (NextAuth)
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des annonces immobilières (CRUD)
- ✅ Génération d'étiquettes vitrine (PDF)
- ✅ Génération automatique des étiquettes DPE/GES (via API externe + Supabase Storage)

### Site vitrine (à venir)
- Liste des biens disponibles
- Fiche détaillée par bien
- Formulaire de contact
- Page d'accueil

## Technologies

- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Base de données**: PostgreSQL (via Docker sur port 5436)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Formulaires**: React Hook Form + Zod

## Installation

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Lancer la base de données

```bash
docker-compose up -d
```

### 3. Configurer l'environnement

Copier `.env.example` vers `.env` et adapter si nécessaire.

Les valeurs par défaut fonctionnent avec Docker :
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/cabinet_rimbault?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# Supabase Storage (pour les images DPE/GES)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

> **Note**: La `SUPABASE_SERVICE_ROLE_KEY` est utilisée côté serveur pour les uploads (bypass des RLS policies). Ne jamais l'exposer côté client.

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

Après le seed, connectez-vous à l'admin :

- **URL**: http://localhost:3000/admin/login
- **Email**: admin@cabinet-rimbault.fr
- **Mot de passe**: admin123

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile l'application |
| `npm run start` | Lance en production |
| `npm run db:push` | Synchronise le schéma Prisma |
| `npm run db:seed` | Exécute le script de seed |
| `npm run db:studio` | Ouvre Prisma Studio |
| `npm run db:reset` | Reset la DB et re-seed |

## Structure du projet

```
src/
├── app/
│   ├── admin/
│   │   ├── (authenticated)/  # Route group - pages protégées
│   │   │   ├── dashboard/    # Tableau de bord
│   │   │   ├── properties/   # Gestion des annonces
│   │   │   ├── labels/       # Génération étiquettes
│   │   │   └── layout.tsx    # Layout avec auth check
│   │   └── login/            # Page de connexion (publique)
│   ├── api/
│   │   ├── auth/             # API NextAuth
│   │   └── labels/           # API génération étiquettes DPE/GES
│   └── page.tsx              # Page d'accueil
├── components/
│   ├── admin/                # Composants admin (sidebar, header)
│   ├── labels/               # Composants étiquettes
│   ├── ui/                   # Composants shadcn/ui
│   └── providers/            # Providers React
├── lib/
│   ├── auth.ts               # Configuration NextAuth
│   ├── prisma.ts             # Client Prisma
│   ├── supabase.ts           # Client Supabase (Storage)
│   └── utils.ts              # Utilitaires
└── types/
    └── next-auth.d.ts        # Types NextAuth
```

## Modèle de données

### User
Utilisateurs de l'admin (agents, administrateurs)

### Property
Biens immobiliers avec toutes leurs caractéristiques :
- Informations de base (titre, description, référence)
- Type et transaction (vente/location)
- Prix et frais
- Localisation
- Caractéristiques (surface, pièces, équipements)
- DPE et informations énergétiques
- Copropriété

### PropertyImage
Images associées aux biens

## Développement

### Ajouter un composant shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

### Modifier le schéma Prisma

1. Modifier `prisma/schema.prisma`
2. Exécuter `npm run db:push`
3. Mettre à jour le seed si nécessaire

## Déploiement

### Variables d'environnement à configurer

- `DATABASE_URL`: URL de la base PostgreSQL
- `NEXTAUTH_URL`: URL de l'application
- `NEXTAUTH_SECRET`: Clé secrète (générer avec `openssl rand -base64 32`)

### Avec Supabase

Pour utiliser Supabase en production :
1. Créer un projet sur supabase.com
2. Utiliser l'URL PostgreSQL fournie dans `DATABASE_URL`
3. Configurer le Storage pour les images (voir ci-dessous)

### Configuration Supabase Storage (étiquettes DPE/GES)

Les étiquettes DPE et GES sont générées via une API externe et stockées dans Supabase Storage.

1. **Créer les buckets** dans Supabase Storage :
   - `labels` : pour les étiquettes PDF générées
   - `files` : pour les images DPE/GES temporaires
2. **Configurer les buckets comme "Public"** (pour la lecture des fichiers)
3. **Récupérer les clés** (Settings > API) :
   - `NEXT_PUBLIC_SUPABASE_URL` : URL du projet
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme (anon/public)
   - `SUPABASE_SERVICE_ROLE_KEY` : Service role key (pour les uploads côté serveur)

> **Important**: La `SUPABASE_SERVICE_ROLE_KEY` permet de bypass les RLS policies pour les opérations d'écriture. Elle est utilisée uniquement côté serveur (API routes) et ne doit jamais être exposée côté client.

### API Labels

#### POST `/api/labels/generate`
Génère une seule étiquette (DPE ou GES) :
```json
{
  "propertyId": "property-id",
  "type": "dpe",
  "lettre": "C",
  "valeur": 150,
  "version": "2021"
}
```

#### PUT `/api/labels/generate`
Génère les deux étiquettes en une requête :
```json
{
  "propertyId": "property-id",
  "dpe": { "lettre": "C", "valeur": 150 },
  "ges": { "lettre": "B", "valeur": 25 },
  "version": "2021"
}
```
