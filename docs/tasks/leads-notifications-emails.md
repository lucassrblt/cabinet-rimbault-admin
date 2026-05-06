# Leads, Notifications & Emails de confirmation

## Contexte

Le site vitrine propose deux parcours publics :
1. **Tunnel d'estimation** — le client decrit son bien, une `Evaluation` est creee via `POST /api/public/evaluation`.
2. **Contact sur un bien** — le client manifeste son interet pour un bien, un `Lead` est cree via `POST /api/public/contact`.

Les endpoints publics et les modeles Prisma existent deja. Ce qui manque : l'admin UI pour gerer les leads, les alertes agent sur le dashboard, et l'envoi d'emails de confirmation aux clients.

### Decisions prises
- **Leads et Estimations restent separes** — section `/leads` dediee, `/estimations` inchange.
- **"Non lu" = statut NOUVEAU/NOUVELLE** — pas de champ `seenAt`, le statut suffit pour un agent unique.
- **Emails via Resend** — SDK TypeScript + templates React Email.

---

## Phase 1 — API admin pour les Leads

> Les evaluations ont deja une API admin complete. Il faut le meme niveau pour les leads.

### Tache 1.1 : GET /api/leads

- [x] Creer `src/app/api/leads/route.ts`
- [x] Proteger avec `requireAuth()`
- [x] Query params : `status` (NOUVEAU, EN_COURS, TRAITE, ARCHIVE), `subject` (BIEN_SALE, BIEN_RENT, ESTIMATION, APPOINTMENT, OTHER)
- [x] Filtre "all" pour ignorer un parametre
- [x] Tri par `createdAt DESC`
- [x] Retour : tableau de leads

### Tache 1.2 : GET /api/leads/[id]

- [x] Creer `src/app/api/leads/[id]/route.ts`
- [x] Proteger avec `requireAuth()`
- [x] Retour : lead complet ou 404

### Tache 1.3 : PATCH /api/leads/[id]

- [x] Meme fichier route que 1.2
- [x] Champs modifiables : `status` (valider enum LeadStatus), `notes`
- [x] Retour : lead mis a jour

### Tache 1.4 : DELETE /api/leads/[id]

- [x] Meme fichier route que 1.2
- [x] Suppression definitive
- [x] Retour : `{ success: true }`

### Tache 1.5 : Tests API leads

- [x] Creer `src/__tests__/api/leads.test.ts` et `src/__tests__/api/leads-id.test.ts`
- [x] Suivre le pattern existant des tests evaluations (`src/__tests__/api/evaluations.test.ts`)
- [x] Couvrir : auth, filtres, CRUD, cas d'erreur

---

## Phase 2 — Admin UI Leads

> Reproduire le pattern de `/estimations` pour les leads.

### Tache 2.1 : Page liste /leads

- [x] Creer `src/app/(authenticated)/leads/page.tsx`
- [x] Stats cards en haut : Total, Nouveaux, En cours, Traites
- [x] Barre de recherche (nom, email, telephone, reference bien)
- [x] Filtres : statut (NOUVEAU, EN_COURS, TRAITE, ARCHIVE) + sujet (BIEN_SALE, BIEN_RENT, etc.)
- [x] Tableau avec colonnes : Date | Demandeur | Contact | Sujet | Bien (reference) | Statut | Actions
- [x] Badges colores pour statut (bleu=nouveau, ambre=en cours, vert=traite, gris=archive)
- [x] Badges pour sujet (couleurs distinctes)
- [x] Clic sur une ligne → navigation vers `/leads/[id]`
- [x] Action suppression avec modale de confirmation

### Tache 2.2 : Page detail /leads/[id]

- [x] Creer `src/app/(authenticated)/leads/[id]/page.tsx`
- [x] Layout 2 colonnes (comme estimations/[id])
- [x] Colonne principale :
  - Card "Informations de contact" : nom, email (lien mailto), telephone (lien tel), message complet
  - Card "Profil" : profil acheteur, financement, disponibilites de visite
  - Card "Bien concerne" : reference (avec lien vers `/properties/[id]` si le bien existe), sujet
  - Card "Notes internes" : textarea + select statut + bouton sauvegarder
- [x] Sidebar :
  - Card "Consentement" : RGPD, source
  - Card "Metadonnees" : ID, date creation, derniere modification, page d'origine, user agent

### Tache 2.3 : Navigation

- [x] Ajouter entree "Leads" dans `AdminSidebar.tsx` (icone `MessageSquare`)
- [x] Ajouter entree "Leads" dans `MobileSidebar.tsx` (+ correction bug : "Estimations" manquant)
- [x] Position dans le menu : apres "Estimations"

---

## Phase 3 — Dashboard enrichi & notifications

### Tache 3.1 : API compteur notifications

- [x] Creer `GET /api/notifications/count` dans `src/app/api/notifications/count/route.ts`
- [x] Proteger avec `requireAuth()`
- [x] Retourner : `{ leads: number, evaluations: number, total: number }`
  - `leads` = count de Lead avec status NOUVEAU
  - `evaluations` = count de Evaluation avec status NOUVELLE
  - `total` = somme des deux

### Tache 3.2 : Badge notification dynamique dans le header

- [x] Modifier `AdminHeader.tsx` : remplacer le point rouge statique par un vrai compteur
- [x] Appeler `GET /api/notifications/count` au montage du composant
- [x] Afficher le badge seulement si `total > 0`
- [x] Afficher le chiffre si > 0 (petit badge rond avec le nombre)
- [x] Au clic sur la cloche : navigation vers `/leads`

### Tache 3.3 : Dashboard — nouvelles stats cards

- [x] Modifier `src/app/(authenticated)/dashboard/page.tsx`
- [x] Ajouter 2 stats cards :
  - "Nouveaux leads" — count de Lead avec status NOUVEAU + icone MessageSquare bleue
  - "Nouvelles estimations" — count de Evaluation avec status NOUVELLE + icone Calculator bleue
- [x] Chaque card cliquable → navigation vers `/leads` ou `/estimations` filtrees sur statut NOUVEAU/NOUVELLE

### Tache 3.4 : Dashboard — section "Dernieres demandes"

- [x] Ajouter sous "Proprietes recentes" une nouvelle section "Dernieres demandes"
- [x] Afficher les 5 derniers leads + evaluations melanges, tries par date decroissante
- [x] Chaque ligne : date, type (badge "Lead" ou "Estimation"), demandeur, sujet/type de bien, statut
- [x] Clic → navigation vers le detail correspondant

### Tache 3.5 : Tests API notifications

- [x] Creer `src/__tests__/api/notifications-count.test.ts`
- [x] Tester : auth requise, compteurs corrects, cas zero

---

## Phase 4 — Emails de confirmation (Resend)

### Tache 4.1 : Setup Resend

- [x] Installer `resend` : `npm install resend`
- [x] Ajouter `RESEND_API_KEY` aux variables d'environnement (`.env.local`, CI secrets)
- [x] Ajouter `AGENCY_EMAIL_FROM` (adresse expediteur verifiee sur Resend, ex: `noreply@cabinet-rimbault.fr`)
- [x] Creer `src/lib/resend.ts` — client Resend lazy (proxy pour eviter crash build sans API key)

### Tache 4.2 : Template email "Contact sur un bien"

- [x] Creer `src/lib/emails/contact-confirmation.tsx`
- [x] Template HTML avec :
  - Objet : "Votre demande concernant [reference du bien] a bien ete recue"
  - Corps : remerciement, rappel du bien concerne (reference, sujet), message du client
  - Mention : "Un professionnel vous contactera dans les plus brefs delais"
  - Coordonnees de l'agence (depuis `AgencySettings` en base)
  - Footer avec mentions legales / RGPD

### Tache 4.3 : Template email "Demande d'estimation"

- [x] Creer `src/lib/emails/evaluation-confirmation.tsx`
- [x] Template HTML avec :
  - Objet : "Votre demande d'estimation a bien ete recue"
  - Corps : remerciement, recap du bien decrit (type, localisation, surface, pieces)
  - Mention : "Un professionnel vous contactera dans les plus brefs delais"
  - Coordonnees de l'agence
  - Footer avec mentions legales / RGPD

### Tache 4.4 : Envoi email a la creation d'un lead

- [x] Modifier `POST /api/public/contact` (`src/app/api/public/contact/route.ts`)
- [x] Apres creation du lead en base, envoyer l'email de confirmation
- [x] Recuperer les infos agence depuis `AgencySettings`
- [x] L'envoi d'email est fire-and-forget (ne pas bloquer la reponse API en cas d'echec)
- [x] Logger les erreurs d'envoi sans faire echouer la requete

### Tache 4.5 : Envoi email a la creation d'une evaluation

- [x] Modifier `POST /api/public/evaluation` (`src/app/api/public/evaluation/route.ts`)
- [x] Meme logique que 4.4 : envoi fire-and-forget apres creation
- [x] Utiliser le template evaluation-confirmation

### Tache 4.6 : Mock Resend dans les tests

- [x] Creer `src/__tests__/mocks/resend.ts`
- [x] Mocker le module `src/lib/resend.ts`
- [x] Mettre a jour les tests existants de `public-contact.test.ts` et `public-evaluation.test.ts`
- [x] Verifier que l'email est bien appele avec les bons parametres
- [x] Verifier que l'echec d'email ne fait pas echouer la requete API

---

## Ordre d'execution recommande

```
Phase 1 (API leads)          ████████░░░░░░░░  ~1 session
Phase 2 (UI leads)           ░░░░████████░░░░  ~1-2 sessions
Phase 3 (Dashboard/notifs)   ░░░░░░░░████░░░░  ~1 session
Phase 4 (Emails Resend)      ░░░░░░░░░░░░████  ~1 session
```

Les phases sont sequentielles : la 2 depend de la 1, la 3 peut commencer en parallele de la 2, la 4 est independante.

## Fichiers cles a modifier/creer

### Nouveaux fichiers
- `src/app/api/leads/route.ts`
- `src/app/api/leads/[id]/route.ts`
- `src/app/api/notifications/count/route.ts`
- `src/app/(authenticated)/leads/page.tsx`
- `src/app/(authenticated)/leads/[id]/page.tsx`
- `src/lib/resend.ts`
- `src/lib/emails/contact-confirmation.tsx`
- `src/lib/emails/evaluation-confirmation.tsx`
- `src/__tests__/api/leads.test.ts`
- `src/__tests__/api/leads-id.test.ts`
- `src/__tests__/api/notifications-count.test.ts`
- `src/__tests__/mocks/resend.ts`

### Fichiers a modifier
- `src/components/admin/AdminSidebar.tsx` — ajouter entree Leads
- `src/components/admin/MobileSidebar.tsx` — ajouter entrees Leads + Estimations
- `src/components/admin/AdminHeader.tsx` — badge notification dynamique
- `src/app/(authenticated)/dashboard/page.tsx` — stats leads/estimations + section dernieres demandes
- `src/app/api/public/contact/route.ts` — envoi email apres creation
- `src/app/api/public/evaluation/route.ts` — envoi email apres creation
- `src/__tests__/api/public-contact.test.ts` — mock Resend
- `src/__tests__/api/public-evaluation.test.ts` — mock Resend

### Variables d'environnement a ajouter
- `RESEND_API_KEY`
- `AGENCY_EMAIL_FROM`
