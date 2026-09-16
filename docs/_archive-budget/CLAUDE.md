# פרוייקט מסכם פיתוח אתרים — projet de fin d'études

> Profil, langue (FR), conventions git/Vercel → `~/.claude/CLAUDE.md`
> Méthode, gates, sécurité → `~/Desktop/claude/PLAYBOOK-WEB.md`
> Ce fichier ne contient que ce qui est propre à ce projet.

---

## 1. Contexte

Projet de fin d'études du cours **« AI-Augmented Web Development »** de **Yariv Gilad**.
Une web app déployée en live. Le stack est **imposé à toute la promo, aucune liberté** :

**Vite + React en JavaScript** (pas TypeScript) · **Supabase** (Postgres, Auth, Storage,
Edge Functions) · **Vercel** + Supabase Cloud · **GitHub**.

> ⚠️ Ce stack **contredit** les conventions par défaut de `~/.claude/CLAUDE.md`
> (Next.js App Router + TypeScript strict + Tailwind v4). Ici c'est le cours qui gagne.
> Ne jamais « corriger » vers Next.js ou TypeScript.

**Ordre pédagogique imposé, volontairement inversé** : Frontend (M6) → Data Design (M7)
→ Backend (M8). *« Your frontend is your blueprint »* — les écrans dictent le schéma,
pas l'inverse. Ne pas concevoir la base de données en premier.

**Règles chiffrées du cours** : 5 Must have MoSCoW max · 8 à 10 user stories · mood board
de 5 à 10 références · 3 à 4 couleurs · 1 à 2 polices · corps 16 px minimum · wireframes
des 3 à 4 écrans clés · responsive vérifié à 375 px et 1440 px · **aucune valeur en dur**
(tout en CSS custom properties depuis `DESIGN.md`) · **jamais une page en un seul
composant monolithique**.

**Le produit** : une app de maîtrise du budget personnel et familial, marché Israël,
interface hébreu RTL, devise ₪. Trois relevés bancaires importés deviennent une image
claire de où part l'argent, puis un calendrier de budget jusqu'à la fin de l'année.

**Documents** : `docs/FLOW.md` (parcours écran par écran) · `docs/PRD.md` (MoSCoW,
user stories, risques, modèle de données).

---

## 2. Les 14 décisions verrouillées

Prises avec Raphael le 25/08/2026 pendant le cadrage. **Ne pas les re-proposer ni les
contourner sans qu'il les rouvre explicitement.**

| # | Sujet | Décision |
|---|---|---|
| 1 | Marché | Israël · hébreu RTL · ₪ |
| 2 | Saisie | manuelle **Must** · CSV/Excel **Must** · PDF **Should** |
| 3 | Espaces | `אישי` + `משותף` · un utilisateur, N espaces étanches |
| 4 | Agent IA | catégoriser · détecter les récurrences · générer le prévisionnel · constater |
| 5 | Parsing | client + écran de mapping → dictionnaire marchands → LLM en Edge Function |
| 6 | Auth | Google · Apple · code 6 chiffres par email · **aucun mot de passe** |
| 7 | Mois | **calendaire** + courbe de trésorerie jour par jour (jour de paie par personne) |
| 8 | Charges non mensuelles | **lissées par défaut**, décochable ligne à ligne |
| 9 | Provisions | **compteur virtuel** · `הפנוי = הכנסות − הוצאות − מה שכבר שמור` |
| 10 | Vie du produit | ré-import mensuel **et** saisie au fil de l'eau |
| 11 | `עסקי` | **hors v1** → Could have |
| 12 | Doublons | carte/compte = **`זמני`**, remplacé par l'import · `מזומן` = définitif |
| 13 | Catégories | ~14 postes israéliens par défaut, renommables, extensibles · **pas de sous-catégories** |
| 14 | État vide | **foyer de démo pré-chargé**, effaçable en un bouton |

**Encore ouvert** : le nom du produit · la deadline réelle · le design (mood board,
couleurs, polices) · le périmètre exact du dashboard personnalisable (Should).

---

## 3. Les trois moments à ne jamais sacrifier

Si le temps manque, tout peut sauter **sauf** :

1. **P7c** — voir trois mois de relevés se ranger tout seuls en catégories.
2. **Le bloc carte par carte de P8** — toutes les apps du marché fusionnent les comptes ;
   celle-ci fait l'inverse, et c'est là qu'est la valeur.
3. **P10** — voir juillet passer au rouge à cause des vacances, et l'app proposer de
   mettre 600 ₪ de côté dès maintenant.

---

## 4. Règles de travail sur ce projet

- **Aucun fichier écrit sans un « go » explicite de Raphael.** Cadrer, questionner,
  recommander : libre. Créer ou modifier un fichier : go requis.
- **Rien n'est commité sans son accord.**
- **Aucun secret hors des Edge Functions.** `import.meta.env.VITE_*` finit en clair dans
  le bundle téléchargeable — une clé Anthropic dans le front est publique en dix secondes.
  Vérifier le bundle avant chaque déploiement.
- **`.vercelignore` obligatoire** dès la création du repo : le CLI Vercel ignore
  `.gitignore` et publierait `.env`.
- **Committer avec `belhassenraphael99@gmail.com`**, sinon déploiement BLOCKED.
- **RLS testée espace par espace, avec deux comptes distincts**, avant toute mise en
  ligne de données réelles. Ce sont des relevés bancaires.
- **Développement et démo sur le foyer fictif uniquement.** Les vraies données de la
  famille n'entrent qu'après vérification de la RLS.
- **R1 d'abord** : tester le parsing sur de vrais exports Leumi / Cal / Max **avant**
  d'écrire une ligne de dashboard. C'est le seul risque dont l'échec est total.
- **Jamais de recommandation d'investissement dans l'interface.** Le ייעוץ פיננסי est
  régulé en Israël : des constats chiffrés et des questions à poser à sa banque.
