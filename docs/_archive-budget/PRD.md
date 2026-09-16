# PRD — Product Requirements Document

> Projet de fin d'études · « AI-Augmented Web Development » · Yariv Gilad
> Auteur : Raphael Belhassen · **v1.0 — 25/08/2026**
> Produit : **[NOM À DÉFINIR]** · Marché Israël · hébreu RTL · ₪
> Stack imposé : Vite + React (JS) · Supabase · Vercel · GitHub
> Parcours détaillé écran par écran : `FLOW.md`

---

## 1. Le problème

Gérer ses dépenses est censé être simple et ne l'est jamais. Les gens tiennent un
tableur, ou ils ne tiennent rien. Le tableur a trois défauts qui le condamnent :

1. **Il est illisible.** Des lignes minuscules, pas de couleur, aucune hiérarchie. On
   ne voit pas où part l'argent, on voit des nombres.
2. **Il regarde en arrière.** Il enregistre ce qui a été dépensé. Il ne dit jamais si
   les vacances de juillet passeront.
3. **Il ment sur les charges non mensuelles.** L'arnona bimestrielle et l'assurance
   annuelle rendent un mois catastrophique et le suivant euphorique. Les deux chiffres
   sont faux.

Les apps du marché ne règlent pas ça : elles exigent une connexion bancaire, elles
fusionnent tous les comptes en un seul total, et elles demandent six mois de saisie
quotidienne avant d'être utiles. La plupart des gens abandonnent en trois semaines.

## 2. La proposition

Une application web qui transforme **trois relevés bancaires** en une image claire de
où part l'argent, puis en un **calendrier de budget** allant jusqu'à la fin de l'année.

Trois partis pris qui la distinguent :

- **Elle dés-agrège au lieu d'agréger.** Les dépenses sont montrées carte par carte,
  compte par compte. Voir ce que coûte *chaque* carte est le moment où l'utilisateur
  comprend quelque chose.
- **Elle provisionne.** Une charge annuelle et une dépense exceptionnelle datée sont le
  même objet : quelque chose à mettre de côté chaque mois d'ici là. Le disponible
  affiché déduit ce qui est déjà promis.
- **Elle est utile au premier usage.** Trois fichiers déposés, et l'app parle. Pas de
  période d'amorçage.

## 3. Utilisateurs

**Persona 1 — Noa, 34 ans, couple avec deux enfants, Petah Tikva.**
Salariée, son conjoint aussi ; elle est payée le 1er, lui le 27. Trois cartes, deux
comptes. Elle tient un tableur qu'elle a arrêté de remplir en mars. Sa question réelle :
*« est-ce qu'on peut partir dix jours en juillet ? »*
Compétence technique : sait exporter un relevé depuis le site de sa banque si on lui
montre une fois.

**Persona 2 — David, 26 ans, célibataire, Tel Aviv.**
Un compte, deux cartes, beaucoup de מסעדות et de מנויים. Ne tient rien du tout. Sa
question réelle : *« pourquoi il ne me reste rien le 20 ? »*

**Non ciblés en v1** : les indépendants et les entreprises (מע"מ, הוצאה מוכרת) ; les
foyers voulant deux connexions séparées sur le même budget.

## 4. Objectifs et critères de réussite

| Objectif | Mesure |
|---|---|
| L'app est utile dès le premier usage | Un utilisateur qui dépose 3 fichiers atteint le dashboard rempli en moins de 5 minutes |
| L'import ne casse pas | Un relevé Leumi, un Cal et un Max réels s'importent sans intervention au code |
| La catégorisation est crédible | ≥ 80 % des lignes correctement catégorisées avant correction manuelle |
| Le prévisionnel est le cœur | L'utilisateur peut répondre « oui / non » à « puis-je partir en juillet » |
| Livrable de cours | 5 Must have livrés, déployé sur Vercel, responsive 375 px et 1440 px |

## 5. MoSCoW

### Must have — 5

**M1 · Compte et espaces**
Connexion Google, Apple ou code à 6 chiffres par email. Aucun mot de passe. Profil.
Création d'un ou deux espaces étanches (`אישי`, `משותף`) avec bascule de l'un à l'autre.

**M2 · Situation financière**
Questionnaire d'onboarding (foyer, revenus, **jour de paie par personne**, aides).
Saisie des charges fixes avec fréquence, jour de prélèvement et **lissage des charges
non mensuelles, activé par défaut et décochable ligne à ligne**. Déclaration des comptes
et des cartes.

**M3 · Entrée des dépenses**
Saisie manuelle avec moyen de paiement pilotant le statut (`זמני` pour carte et compte,
définitif pour מזומן). Import `.csv` / `.xlsx` / `.xls` avec écran de mapping des
colonnes mémorisé par compte, catégorisation en deux passes (dictionnaire de marchands,
puis LLM en Edge Function sur les seuls libellés inconnus), écran de révision, et
remplacement des lignes `זמני` recouvertes par l'import.

**M4 · Dashboard**
Revenus, dépenses et **disponible réel** (net des provisions). Répartition par poste.
**Dépenses carte par carte, non fusionnées.** Courbe de trésorerie du mois jour par
jour avec les dates de paie. Ce qui est mis de côté. Constats chiffrés de l'agent.

**M5 · Agenda prévisionnel**
Vues annuelle et mensuelle. Charges fixes, budget variable estimé, événements datés.
**Provisionnement à rebours** des événements et des charges annuelles. Mois en déficit
signalé, avec propositions de coupes chiffrées.

### Should have
- Import PDF de relevé
- Auto-détection des abonnements récurrents alimentant M2 rétroactivement
- Dashboard personnalisable — afficher, masquer, réordonner les blocs
- MFA TOTP en second facteur applicatif
- Export CSV des données

### Could have
- Espace `עסקי` avec מע"מ et הוצאה מוכרת
- Invitation réelle du conjoint sur un espace `משותף`
- Provisions adossées à un vrai compte d'épargne
- Notifications par email en début de mois

### Won't have — v1, décision écrite
- **Connexion bancaire automatique** — comptes professionnels payants, KYC, hors délai
- **Conseil en investissement, pension, comparaison de דמי ניהול** — le ייעוץ פיננסי est
  régulé en Israël. L'app produit des constats chiffrés et des questions à poser à sa
  banque, jamais une recommandation
- Bourse, crypto, patrimoine
- Multi-devise
- Application mobile native

## 6. User stories

Format standard, prêtes pour le rendu.

| # | Story | Must |
|---|---|---|
| US1 | *As a new user, I want to sign in with Google, Apple or an emailed code, so that I never have to create or remember another password.* | M1 |
| US2 | *As a user with both personal and household finances, I want to keep them in separate spaces, so that my own spending never mixes with the family budget.* | M1 |
| US3 | *As a couple paid on different days of the month, I want to declare each salary date, so that the app shows me when cash actually runs low.* | M2 |
| US4 | *As someone who pays arnona every two months, I want the app to spread it across months by default, so that one month doesn't look like a disaster and the next like a windfall.* | M2 |
| US5 | *As a user with several cards, I want to declare each account and card separately, so that I can see what each one really costs me.* | M2 |
| US6 | *As a user exporting from an Israeli bank, I want to map the file's columns myself when the app guesses wrong, so that an unusual export never blocks me.* | M3 |
| US7 | *As a user importing three months at once, I want transactions categorised automatically and to correct what's wrong, so that I get a usable picture in minutes instead of hours.* | M3 |
| US8 | *As someone who pays cash, I want to record a cash expense that no import will ever erase, so that my picture stays complete.* | M3 |
| US9 | *As a user asking where the money goes, I want spending broken down per card and per category, so that I can see which card is bleeding me.* | M4 |
| US10 | *As a user planning a 3 000 ₪ holiday in July, I want the app to spread it as 600 ₪ per month from February, so that July doesn't wreck the budget.* | M5 |
| US11 | *As a user whose month doesn't balance, I want the app to propose specific cuts with amounts, so that I have something actionable instead of a red number.* | M5 |
| US12 | *As a first-time visitor, I want to load a demo household in one click, so that I can see what the app does before entering any of my own data.* | M4 |

## 7. Décisions verrouillées

Les 14 décisions de cadrage sont dans `../CLAUDE.md` §2. Elles ne sont pas rediscutées
sans raison écrite.

## 8. Risques

| # | Risque | Gravité | Parade |
|---|---|---|---|
| R1 | **Le parsing des relevés israéliens réels** (Leumi, Cal, Max — hébreu, DD/MM, vieux `.xls`) | 🔴 Bloquant | Tester sur de vrais fichiers **avant** d'écrire le dashboard. L'écran de mapping P7b est la parade structurelle. La saisie manuelle en Must garantit que l'app vit même si l'import échoue |
| R2 | **Périmètre contre délai** — 5 Must copieux, délai court | 🔴 | Ligne de coupe déjà définie : les trois moments à préserver en dernier sont P7c, le bloc carte par carte de P8, et P10 |
| R3 | **Coût et latence du LLM** sur des milliers de lignes | 🟠 | Dictionnaire de marchands en première passe, LLM par lots sur les seuls inconnus, chaque correction enrichit le dictionnaire |
| R4 | **Fuite d'une clé API dans le bundle Vite** | 🟠 | Aucun secret hors des Edge Functions. Vérification du bundle avant chaque déploiement |
| R5 | **Juridique** — ייעוץ פיננסי régulé en Israël | 🟠 | Constats chiffrés et questions à poser à sa banque. Jamais de recommandation d'investissement. Mention explicite dans l'app |
| R6 | **RLS mal posée** sur des données bancaires | 🟠 | Policies testées espace par espace avec deux comptes distincts, avant toute mise en ligne de vraies données |
| R7 | **Données réelles de Raphael en production** | 🟠 | Démo et développement sur le **foyer fictif** uniquement. Les vraies données n'entrent qu'après vérification de la RLS |

## 9. Architecture

```
React (Vite, JS)  ──┬── supabase-js ──▶  Postgres   [RLS : space_id → owner_id = auth.uid()]
   RTL, responsive  │                     Auth       Google · Apple · email OTP
   375 / 1440       │                     Storage    fichiers importés
                    │
                    └── functions.invoke ▶  Edge Function « categorize » (Deno)
                                              1. dictionnaire merchants  (SQL, gratuit)
                                              2. Claude Haiku par lots   [clé serveur]
```

Déploiement : Vercel (front) · Supabase Cloud (données, auth, functions).

## 10. Esquisse du modèle de données

> Le cours impose Front (M6) → Data (M7) → Backend (M8). Cette esquisse existe pour
> vérifier que le parcours est réalisable ; **elle sera confirmée ou refaite au module 7,
> à partir des écrans réellement construits.**

- `profiles` — id → auth.users · prénom · nom · email · téléphone
- `spaces` — owner_id · type (`personal` | `joint`) · nom
- `income_sources` — space_id · libellé · personne · montant net · **jour de paie**
- `accounts` — space_id · nom · type (`bank` | `card`) · 4 derniers chiffres · frais
- `categories` — space_id (nul = catégorie par défaut) · nom · couleur · icône
- `merchants` — motif · category_id · space_id (nul = dictionnaire global)
- `fixed_charges` — space_id · nom · montant · fréquence · jour · mois · account_id ·
  category_id · **smoothed**
- `transactions` — space_id · account_id · date · montant · libellé brut · category_id ·
  origine (`imported` | `manual`) · moyen (`card` | `bank` | `cash`) ·
  **statut (`pending` | `final`)** · import_batch_id
- `import_batches` — space_id · account_id · fichier · période · **mapping (jsonb)**
- `budget_events` — space_id · nom · date début · date fin · montant · category_id ·
  **provisionner à partir de** · récurrence annuelle

Les provisions ne sont pas une table : elles se **calculent** à partir de
`fixed_charges.smoothed` et de `budget_events.provision_from`. Une seule fonction.

## 11. Livrables du cours — à vérifier auprès du prof

- [ ] PRD — ce document
- [ ] Task plan — exigé comme prérequis du module 6, format non défini dans le cours
- [ ] Mood board (5 à 10 références)
- [ ] `DESIGN.md` — 3 à 4 couleurs, 1 à 2 polices, corps 16 px minimum, tout en CSS
      custom properties, aucune valeur en dur
- [ ] Wireframes des 4 écrans clés : P5 · P7c · P8 · P10
- [ ] Responsive vérifié à 375 px et 1440 px
- [ ] Déploiement Vercel + Supabase Cloud
- [ ] **Deadline et grille d'évaluation : non publiées à ce jour — à demander**
