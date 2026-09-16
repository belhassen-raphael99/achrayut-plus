# FLOW — parcours complet, page par page

> Projet de fin d'études · cours « AI-Augmented Web Development » (Yariv Gilad)
> Stack imposé : Vite + React (JS) · Supabase · Vercel · GitHub
> Marché Israël · interface hébreu RTL · devise ₪
> **v0.2 — 25/08/2026** · intègre les 14 décisions de cadrage (voir `../CLAUDE.md`)
> Nom du produit : **[À DÉFINIR]**

---

## 0. Le produit en une phrase

Une app qui transforme trois mois de relevés bancaires illisibles en une image claire de
où part l'argent, puis en un calendrier de budget qui va jusqu'à la fin de l'année.

**Contre un tableur** : elle regarde vers l'avant. Un tableur raconte le passé ; ici,
l'écran qui porte le produit est un **agenda prévisionnel**.

**Contre une app bancaire** : elle ne se connecte à aucune banque, elle sépare les
dépenses **carte par carte au lieu de tout fusionner**, et elle prévoit les dépenses
**exceptionnelles datées** (חופשה, טסט, חתונה, חגים) que les banques ignorent.

**Contre les apps de suivi** : elle ne demande pas de noter chaque dépense pendant six
mois avant d'être utile. Trois fichiers importés et l'app parle.

---

## 1. Carte des écrans

```
NON CONNECTÉ
  P0   Landing
  P1   Connexion / inscription — Google · Apple · code à 6 chiffres par email

ONBOARDING  (une seule fois, linéaire, barre de progression, tout modifiable ensuite)
  P2   Profil
  P3   Espaces           — אישי et/ou משותף
  P4   Questionnaire     — situation du foyer, revenus, jours de paie
  P5   Charges fixes  ⭐
  P6   Comptes & cartes
  P7   Import (skippable) : P7a dépôt → P7b mapping → P7c révision  ⭐(P7c)

APP  (4 onglets permanents)
  P8   Dashboard  ⭐      ← écran d'accueil
  P9   Transactions
  P10  Agenda prévisionnel  ⭐
  P11  Réglages

SECONDAIRES
  P12  Détail d'une catégorie
  P13  Création / édition d'un événement budgété
  P14  Sélecteur d'espace (overlay, accessible partout)
  P15  Ajout rapide d'une dépense (modale, accessible partout)
```

⭐ = les 4 wireframes exigés par le cours : **P5 · P7c · P8 · P10**.

---

## 2. Le parcours, écran par écran

### P0 — Landing
- **But** : expliquer en 5 secondes, faire cliquer sur `התחל`.
- Une accroche, une capture du dashboard, trois bénéfices (voir où part l'argent ·
  prévoir l'année · aucune connexion bancaire), un bouton.
- **Pas de** : formulaire, tarifs, blog, page « à propos ».
- Sert aussi de vitrine portfolio — c'est l'écran qu'un recruteur voit en premier.

### P1 — Connexion / inscription
- **Trois chemins, aucun mot de passe** :
  `התחבר עם Google` · `התחבר עם Apple` · `קוד לאימייל` (code à 6 chiffres, `signInWithOtp`).
- **Décision de sécurité assumée** : pas d'email + mot de passe. Rien à voler, rien à
  réinitialiser, rien à stocker. Google et Apple apportent leur propre 2FA ; le code par
  email vaut facteur de possession. À écrire tel quel dans le PRD — c'est un choix
  défendable, pas un raccourci.
- Redirection : profil existant → P8, sinon → P2.

### P2 — Profil
- `שם פרטי` · `שם משפחה` · `אימייל` (pré-rempli, non modifiable) · `טלפון` (facultatif,
  et marqué comme tel à l'écran).

### P3 — Espaces
- **Question** : `למה תשתמש באפליקציה?` — cases à cocher, une ou les deux :
  `אישי` · `משותף`.
- **Un espace = un budget totalement étanche.** Aucune donnée ne traverse. On bascule
  par P14.
- L'espace `משותף` appartient à un seul utilisateur, qui y saisit **deux revenus**.
  Le conjoint ne se connecte pas de son côté en v1 (Could have) — ça évite une RLS par
  appartenance de foyer, soit 1 jour de travail au lieu de 5.
- `עסקי` **retiré de la v1** (Could have). Un espace business sans מע"מ ni
  הוצאה מוכרת ne serait qu'un espace personnel avec une autre étiquette.

### P4 — Questionnaire
- **Une question par écran**, réponses en gros boutons. Rien de bloquant, tout
  modifiable depuis P11.

1. `מצב משפחתי` — רווק · נשוי · זוגיות · גרוש
2. `כמה נפשות בבית?` — adultes / enfants
3. `דיור` — שכירות · משכנתא · בבעלות ללא משכנתא · אצל ההורים
4. `הכנסה חודשית נטו` — **un montant par personne active**
5. `באיזה יום בחודש נכנס השכר?` — **une réponse par personne.** En Israël chacun est
   payé selon son employeur : le 1er, le 3, le 10, le 27. Dans un couple, les deux
   dates diffèrent presque toujours.
6. `קצבאות והכנסות נוספות` — קצבת ילדים · מלגה · סיוע בשכר דירה · אחר
7. `כמה חשבונות בנק יש לך?`
8. `כמה כרטיסי אשראי?`

- **Ce que la question 5 pilote** : elle ne change pas le découpage du budget — celui-ci
  reste **calendaire**, parce que le loyer, l'arnona et le גן tombent à date fixe et que
  c'est ainsi que les gens pensent. Elle alimente la **courbe de trésorerie** de P8 :
  « le 22 tu es à −400 ₪, le 27 le second salaire rentre ». C'est la vraie question d'un
  foyer, pas « quel est mon mois budgétaire ».

### P5 — Charges fixes ⭐ wireframe
- **But** : saisir ce qui revient tous les mois sans avoir à se demander quoi lister.
- **Liste pré-remplie cochable, adaptée à Israël** — שכר דירה / משכנתא · ארנונה · חשמל ·
  מים · גז · אינטרנט · סלולר · ביטוח רכב · ביטוח בריאות · ביטוח דירה ·
  גן / צהרון / חוג · מנויים · הלוואות. Plus une ligne libre.
- **Par charge** : nom · montant · fréquence (`חודשי` · `דו־חודשי` · `שנתי`) · jour de
  prélèvement · compte ou carte · **`לפרוס על פני החודשים`**.
- **Lissage coché par défaut** sur tout ce qui n'est pas mensuel, décochable ligne à
  ligne. Une arnona de 1 200 ₪ tous les deux mois compte 600 ₪ chaque mois ; une
  assurance auto de 3 600 ₪ par an compte 300 ₪ chaque mois.
- **Pourquoi par défaut** : sans lissage, mars affiche 4 800 ₪ et février 0 ₪. Les deux
  chiffres sont faux — février était censé mettre de côté pour mars. C'est l'erreur que
  fait tout budget tenu à la main.

### P6 — Comptes & cartes
- Par contenant : nom libre (`לאומי עו"ש`, `Cal זהב`) · type (`חשבון` · `כרטיס אשראי`) ·
  4 derniers chiffres (facultatif, sert à rattacher un fichier importé au bon contenant) ·
  frais mensuels connus.
- **Pourquoi une page entière et pas un coin des réglages** : le bloc signature du
  dashboard montre les dépenses **carte par carte, non fusionnées**. `account_id` est une
  dimension de première classe du modèle, pas un champ décoratif.

### P7 — Import  *(skippable — `אעשה את זה אחר כך`)*

**P7a — Dépôt**
- Un fichier à la fois. Consigne affichée : **un fichier par compte et un par carte**,
  les trois derniers mois.
- Formats v1 : `.csv` · `.xlsx` · `.xls`. Le PDF est un Should have.
- Parsé **dans le navigateur** (SheetJS). Rien n'est envoyé avant validation.

**P7b — Mapping des colonnes**
- L'app devine, l'utilisateur corrige : quelle colonne porte la date, le montant, le
  libellé. Aperçu live des 5 premières lignes.
- Gère `DD/MM/YYYY`, montants négatifs, colonnes `חובה`/`זכות` séparées, en-têtes en
  hébreu, lignes de titre parasites en tête de fichier.
- **Le mapping est mémorisé par compte** : le mois suivant, l'import prend dix secondes.
- **Pourquoi cet écran existe** : sans lui, un export Leumi légèrement différent fait
  échouer l'import sans explication. Avec lui, l'utilisateur rattrape n'importe quel
  format. C'est l'assurance-vie de la démo.

**P7c — Révision des catégories** ⭐ wireframe
- Les transactions arrivent déjà catégorisées ; l'utilisateur corrige ce qui est faux.
- **Deux passes** :
  1. **Dictionnaire de marchands** (table `merchants`) — רמי לוי → סופר · פז → דלק ·
     סלקום → תקשורת. Instantané, gratuit, couvre la majorité des lignes.
  2. **LLM** — Edge Function Supabase, par lots, **uniquement sur les libellés inconnus**.
     La clé API vit côté serveur et n'entre jamais dans le bundle Vite.
- **Chaque correction enrichit le dictionnaire.** La fois suivante, la ligne est reconnue
  sans appel API : l'app devient plus rapide et moins chère à l'usage.
- Affiche aussi les **récurrences détectées** : « ce prélèvement revient chaque mois,
  l'ajouter aux charges fixes ? » → alimente P5 rétroactivement.
- **Déduplication** : les transactions `זמני` (voir P15) que l'import recouvre sont
  remplacées par les vraies lignes de la banque.

### P8 — Dashboard ⭐ wireframe · page d'accueil
- **La question** : `לאן הכסף שלי הולך?`
- **Bandeau** : mois en cours · הכנסות · הוצאות · **הפנוי** en très gros.
  `הפנוי = הכנסות − הוצאות − מה שכבר שמור` (voir provisions).
- **Blocs** :
  - Répartition par poste — cliquable vers P12
  - **Dépenses carte par carte** — non fusionnées, bloc signature
  - **Courbe de trésorerie du mois**, jour par jour, avec les dates de salaire marquées
  - Fixe vs variable
  - **Ce qui est mis de côté** — `שמור: 1 800 ₪ — 1 200 לארנונה, 600 לביטוח`
  - Comparaison des mois importés
  - **Constats de l'agent** — `ההוצאה על מסעדות עלתה ב־40% לעומת החודש שעבר`.
    Des **constats chiffrés uniquement.** Jamais de recommandation d'investissement :
    le ייעוץ פיננסי est régulé en Israël.
- **Personnalisable** (Should) : afficher / masquer / réordonner les blocs.

### P9 — Transactions
- Filtres : mois · catégorie · compte ou carte · recherche texte.
- Édition en ligne de la catégorie. Suppression d'un lot d'import entier en une action.
- Les lignes `זמני` sont visuellement distinctes de celles confirmées par la banque.

### P10 — Agenda prévisionnel ⭐ wireframe · cœur du produit
- **La question** : `האם אני אצליח לעמוד בזה?`
- **Deux vues** : `שנתי` (12 mois côte à côte) et `חודשי`.
- Par mois : charges fixes (lissées ou non selon le réglage de chaque ligne) · budget
  variable estimé d'après les mois importés · **événements datés** · reste disponible,
  en vert ou en rouge.
- **Événements datés** — ce qui manque à toutes les apps de budget :
  `חופשה 01/07 → 10/07 = 3 000 ₪`, **en plus** des frais connus.
- **Provisionnement à rebours** : 3 000 ₪ au 1er juillet, saisis en février, deviennent
  600 ₪ par mois pendant cinq mois. Juillet n'explose plus.
- **Quand ça ne rentre pas** : l'app chiffre le déficit et **propose des coupes**
  (« au lieu de 500 ₪ de restaurants, 300 ₪ → il manque encore 200 ₪ »). Elle ne bloque
  pas et ne fait pas la morale.

### P11 — Réglages
- Profil · espaces · comptes et cartes · charges fixes · catégories · **charger ou
  effacer le foyer de démo** · export des données · suppression du compte.
- La suppression du compte efface réellement les données. Obligation minimale sur des
  données financières, et un point à montrer au prof.

### P12 — Détail d'une catégorie
- Toutes les transactions du poste · évolution sur les mois disponibles · budget fixé
  pour ce poste et consommation en cours.

### P13 — Créer un événement budgété
- Nom · date ou plage · montant estimé · catégorie · récurrence annuelle
  (חגים, ביטוח שנתי, טסט) · **à provisionner à partir de quel mois**.

### P14 — Sélecteur d'espace
- Toujours accessible en tête d'écran. Basculer recharge toute l'app sur l'espace choisi.

### P15 — Ajout rapide d'une dépense
- Modale accessible depuis partout : montant · catégorie · date · **moyen de paiement**.
- **Le moyen de paiement décide du cycle de vie de la ligne** :
  - `כרטיס` ou `חשבון` → statut **`זמני`**. La banque en a une trace ; l'import du mois
    la remplacera par la ligne officielle. Pas de double comptage.
  - `מזומן` → **définitif**. Aucun relevé ne la contiendra jamais ; c'est la seule façon
    de tracer le cash.

---

## 3. Provisions — la mécanique centrale

Le lissage de P5 et le provisionnement de P10 sont **le même calcul**. Une charge
annuelle est un événement récurrent provisionné. Une seule fonction à écrire, une seule
à tester.

L'app tient un **compteur virtuel** : l'argent reste sur le compte courant, mais elle
sait ce qui est déjà promis. Fin février : `שמור 1 800 ₪`. L'arnona tombe en mars, le
compteur retombe à 600 ₪.

**Conséquence sur le chiffre le plus important de l'app** :

```
הפנוי  =  הכנסות  −  הוצאות בפועל  −  מה שכבר שמור
```

Sans la troisième soustraction, le disponible affiché est un mensonge — c'est très
exactement pourquoi les budgets tenus sur tableur ne tiennent pas.

---

## 4. La vie du produit après les trois premiers mois

Une app de budget qui sert une fois est morte. Deux voies, en parallèle :

- **Ré-import mensuel** — rappel en début de mois, mapping déjà mémorisé, dix secondes.
- **Saisie au fil de l'eau** (P15) — pour le cash et pour voir son mois en temps réel.

Le statut `זמני` est ce qui permet aux deux de coexister sans jamais compter deux fois.

---

## 5. État vide et démonstration

Un compte neuf affiche un dashboard vide. Inacceptable le jour de la soutenance.

**`נסה עם נתוני דמו`** charge un foyer israélien fictif complet : 2 comptes, 4 cartes,
3 mois de transactions réalistes, une חופשה en juillet, des charges fixes typiques.
Tout fonctionne immédiatement ; un bouton efface tout.

Triple usage : sauve la démo · sert de bac à sable aux vrais utilisateurs · fournit un
jeu de données stable pendant tout le développement.

---

## 6. Ce que l'app ne fait pas — écrit pour ne plus y revenir

- Connexion bancaire automatique (open banking) — comptes pro payants, KYC, hors délai.
- Conseil en investissement, pension, comparaison de דמי ניהול — **régulé en Israël**.
  L'app formule des constats chiffrés et des questions à poser à sa banque.
- Bourse, crypto, patrimoine.
- Espace `עסקי`, מע"מ, הוצאה מוכרת.
- Compte partagé où le conjoint se connecte de son côté.
- Multi-devise.
- Application mobile native — site responsive, vérifié à 375 px et 1440 px.
