# Web App JDR

## SPEC V2 - Alignement au wiki scrape (Fextralife-like)

### Objectif de cette V2

Cette version remplace l'approche "wiki generique" par une approche "fidelite structurelle" au wiki scrape, tout en conservant les besoins JDR multi-groupes et Daggerheart.

Ce document apporte :

- Une analyse ecarts entre le scrap et le cahier initial
- Une specification technique cible, prete a implementer
- Un decoupage de composants et de donnees conforme a l'UX observee

---

## 1) Analyse des scraps vs cahier des charges

### 1.1 Ce que le scrap confirme (a conserver absolument)

Patterns dominants identifies sur Home, NPC, Item, Armor, Map :

- Coquille de page tres stable : double barre haute + colonne gauche + contenu central + infobox droite
- Palette sombre avec accent or/cuivre (valeur recurrente proche de `#ab966f`)
- Header article standardise : titre, meta, date de mise a jour, actions
- Sidebar de navigation hierarchique profonde (sections + sous-sections)
- Corps de page de type wiki : paragraphs, tableaux, sections h3/h4, listes, liens internes
- Infobox tabulaire a droite avec image + stats/attributs structurants
- Multiples liens internes contextuels (effet "graphe wiki")
- Carte interactive riche (Leaflet + filtres categories + recherche + popups)

Conclusion : le produit doit etre pense comme un "moteur wiki thematise" et non une simple app CRUD avec quelques pages.

### 1.2 Ecarts majeurs du cahier initial

Le cahier initial est globalement bon sur les fonctionnalites metier, mais trop ouvert sur la forme.

Ecarts a corriger :

- Stack trop indecise (Flask ou Express, React ou vanilla) : il faut trancher pour garantir coherence UI/UX
- Le layout "Fextralife-like" est cite mais pas impose comme contrat de composants
- L'infobox est mentionnee mais pas normalisee par type d'entite
- Le menu lateral n'a pas de source de verite (structure de navigation configurable)
- Les pages metier JDR n'imposent pas encore la composition "article + infobox + liens croises"
- La carte est envisagee en iframe, alors que le scrap montre un comportement interactif natif (filtres, sidebar, deep-link)

### 1.3 Decision de cadrage V2

Priorite produit :

1. Fidelite visuelle et structurelle au wiki scrape
2. Capacites MJ multi-groupes
3. Integrite des donnees Daggerheart

Tout ecran doit respecter un gabarit wiki commun. Les modules NEWS/GENERAL/CHARACTER/EQUIPMENT/WORLD deviennent des "variantes de contenu" du meme systeme de page.

---

## 2) Specification technique refondue (cible)

## 2.1 Stack retenue (figee)

- Frontend : React + TypeScript + Vite
- Styling : CSS modulaire + variables globales (sans framework UI)
- Backend : Node.js + Express + TypeScript
- DB : SQLite (better-sqlite3)
- Recherche : SQLite FTS5
- Carte : Leaflet integre dans l'application (pas iframe comme solution principale)

Pourquoi : la base existante du workspace est deja en React/Vite; cette option minimise la friction et accelere la livraison d'une UI fidele.

## 2.2 Contrat UI global (obligatoire)

Chaque page applicative doit utiliser ce shell :

- `TopBarPrimary` : branding wiki + recherche globale + acces rapide
- `TopBarSecondary` : menu categories principales
- `LeftRail` : navigation arborescente (collapsible)
- `WikiMain` : contenu article
- `InfoBoxRail` : infobox sticky contextuelle (masquee sur mobile)
- `UtilityRail` : actions flottantes (back to top, expand, outils MJ)

Comportement responsive :

- Desktop : 3 colonnes (`LeftRail` / `WikiMain` / `InfoBoxRail`)
- Tablet : 2 colonnes (`WikiMain` + infobox sous forme bloc)
- Mobile : menu lateral en drawer + infobox repliee en accordions

## 2.3 Direction visuelle (inspiree du scrap)

Tokens design de base :

- `--bg-main: #1a1a1a`
- `--bg-panel: #232323`
- `--text-main: #e7e2d8`
- `--text-muted: #b8b1a3`
- `--accent: #ab966f`
- `--border: #3a352d`

Regles :

- Contraste fort texte/fond
- Bordures fines sur panels et tableaux wiki
- Liens internes en accent, hover plus lumineux
- Titres de section stylises type "wiki"
- Aucune dependance ads/analytics/scripts tiers issus du scrap

## 2.4 Types de pages et gabarits

### Home wiki

- Hero + messages d'actualites
- Blocs categories (GENERAL, CHARACTER, EQUIPMENT, WORLD)
- Cartes de liens profonds
- Flux recents / modifications

### Page article standard

- Header article (titre + date + meta)
- Corps wiki riche (Markdown rendu + blocs speciaux)
- Infobox a droite (schema selon type)
- Sections "Notes", "Liens associes", "Historique"

### Page entite (PNJ, monstre, item, lieu, faction)

- Meme base qu'article standard
- Infobox specialisee (attributs type-dependants)
- Bloc etat par groupe (vivant/mort/decouvert/etc.)
- Bloc relations (entites connectees)

### Page carte monde

- Layout pleine largeur pour la zone carte
- Panneau lateral de filtres/couches
- Recherche de lieux/points d'interet
- Popup marker avec lien vers fiche wiki
- Deep-link URL pour conserver position/filtres/zoom

---

## 3) Architecture fonctionnelle

## 3.1 Modules metier conserves

- NEWS : dashboard MJ, chronologie sessions, alertes
- GENERAL : lore, chroniques, factions, chronologie monde
- CHARACTER : PJ, PNJ, monstres, boss, compagnons
- EQUIPMENT : armes, armures, artefacts, consommables
- WORLD : lieux, regions, carte interactive, etats par groupe

## 3.2 Modele de navigation wiki

Navigation composee de :

- Menu principal (categories racine)
- Arbre lateral synchronise par contexte de page
- Fil d'Ariane (breadcrumb)
- Liens internes automatiques dans le contenu
- Recherche globale (titre, tags, extrait)

Source de verite navigation : table SQLite dediee (`nav_nodes`) pour editer l'arborescence sans toucher au code.

## 3.3 Capacites MJ multi-groupes

Fonctions obligatoires :

- Etat d'entite par groupe (decouvert, rencontre, vivant, mort, allie, hostile)
- Visibilite par groupe et par section (spoiler control)
- Journal de session lie aux entites/lieux
- Impact global (evenement declenche par groupe A visible pour groupe B)

---

## 4) Modele de donnees V2 (SQLite)

## 4.1 Tables coeur

- `groups` : groupes de joueurs
- `pages` : toutes les pages wiki (home exclue ou incluse selon choix)
- `entities` : objets metier typifies (npc, item, location, etc.)
- `entity_types` : normalisation des types
- `infobox_templates` : schema de champs par type
- `infobox_values` : valeurs de champs par entite
- `page_links` : graphe des liens internes
- `tags` / `page_tags`
- `sessions` : logs de sessions MJ
- `group_entity_state` : etat d'une entite pour un groupe
- `group_page_visibility` : droits de lecture par groupe/section
- `nav_nodes` : arbre de navigation lateral et top menu
- `map_markers` : points carte relies a entites/pages
- `map_layers` : couches/filtres carte

## 4.2 Recherche

- Vue FTS5 sur `pages.title`, `pages.content`, `entities.name`, tags
- API de recherche unique avec ponderation : titre > tags > contenu

## 4.3 Versioning minimal

- `page_revisions` : snapshot markdown/html, auteur, date, raison
- Historique affichable dans bloc "History" style wiki

---

## 5) API (Express)

## 5.1 Endpoints principaux

- `GET /api/nav`
- `GET /api/search?q=`
- `GET /api/pages/:slug`
- `GET /api/entities/:id`
- `GET /api/entities/:id/infobox`
- `GET /api/groups/:id/state`
- `PATCH /api/groups/:id/entities/:entityId/state`
- `GET /api/map/config`
- `GET /api/map/markers`
- `POST /api/sessions`
- `GET /api/sessions?groupId=&entityId=`

## 5.2 Regles

- API local-first (pas d'auth cloud obligatoire)
- Validation stricte des payloads (zod ou equivalent)
- Slug unique pour toute page navigable

---

## 6) Carte interactive (spec cible)

Implementation front native Leaflet :

- Fond de carte image/tuiles selon assets disponibles
- Couches de categories activables/desactivables
- Barre de recherche de points d'interet
- Sidebar de details des resultats
- Popups avec actions : ouvrir fiche, copier coordonnees, marquer visibilite groupe
- URL state : `?lat=&lng=&z=&layers=&q=`

Interoperabilite wiki :

- Un marker peut pointer vers une page ou une entite
- Une page "Lieu" peut afficher ses markers associes

---

## 7) Exigences de qualite

- Temps de chargement initial cible : < 2.5s local
- Recherche percue : < 150ms sur base standard MJ
- Toutes les pages doivent fonctionner sans scripts tiers externes
- Accessibilite : navigation clavier sur menu, contraste AA minimum

---

## 8) Plan d'implementation recommande

1. Mettre en place le shell wiki global (double topbar + left rail + main + infobox rail)
2. Brancher navigation dynamique (`nav_nodes`) + breadcrumb
3. Implementer page article standard + rendu markdown + liens internes
4. Implementer infobox templates + rendu type-dependant
5. Implementer etats multi-groupes
6. Integrer carte Leaflet native + marker links
7. Ajouter recherche FTS5 + historique revisions
8. Finaliser styles de fidelite visuelle

---

## 9) Definition de "ressemble au wiki scrape"

Le resultat est valide si :

- La structure visuelle percue est la meme (coquille, colonnes, hierarchie)
- Les pages entites utilisent une infobox droite a lecture rapide
- La navigation laterale est profonde et contextuelle
- Les liens internes donnent un sentiment de "monde connecte"
- La carte a recherche + filtres + popups relies aux fiches

Si un choix technique entre en conflit avec cette perception, la perception visuelle/interaction du wiki scrape est prioritaire.

---

## 10) Non-objectifs explicites

- Reproduire les pubs, trackers, scripts analytics, widgets externes du site scrape
- Cloner pixel-perfect tous les artefacts legacy
- Ouvrir l'application publiquement (scope local MJ en priorite)

---

## 11) Notes de migration depuis le cahier initial

- Le cahier initial reste la base metier
- Cette V2 devient la reference de layout, composants et decisions techniques
- En cas de contradiction, appliquer la V2

---

# Cahier des Charges — Application Wiki JDR Multi-Groupes

### Système de règles : Daggerheart | Base de données : SQLite | Inspiré de Fextralife Wiki

---

## Table des matières

1. [Contexte & Objectifs](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#1-contexte--objectifs)
2. [Analyse du modèle Fextralife](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#2-analyse-du-mod%C3%A8le-fextralife)
3. [Architecture Générale](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#3-architecture-g%C3%A9n%C3%A9rale)
4. [Navigation & Structure des Pages](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#4-navigation--structure-des-pages)
5. [Module NEWS — Dashboard](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#5-module-news--dashboard)
6. [Module GÉNÉRAL — Lore & Histoire](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#6-module-g%C3%A9n%C3%A9ral--lore--histoire)
7. [Module CHARACTER — Personnages](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#7-module-character--personnages)
8. [Module EQUIPMENT — Équipements](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#8-module-equipment--%C3%A9quipements)
9. [Module WORLD — Monde & Carte](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#9-module-world--monde--carte)
10. [Système de Liaisons (Links)](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#10-syst%C3%A8me-de-liaisons-links)
11. [Gestion Multi-Groupes](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#11-gestion-multi-groupes)
12. [Système Daggerheart — Intégration Règles](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#12-syst%C3%A8me-daggerheart--int%C3%A9gration-r%C3%A8gles)
13. [Schéma de Base de Données SQLite](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#13-sch%C3%A9ma-de-base-de-donn%C3%A9es-sqlite)
14. [UI/UX — Charte Graphique](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#14-uiux--charte-graphique)
15. [Intégration de la Carte Interactive](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#15-int%C3%A9gration-de-la-carte-interactive)
16. [Fonctionnalités Transversales](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#16-fonctionnalit%C3%A9s-transversales)
17. [Contraintes Techniques](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#17-contraintes-techniques)
18. [Planning de Développement (Phases)](https://claude.ai/chat/e7966b0e-e512-46eb-94e9-763db7611d3a#18-planning-de-d%C3%A9veloppement-phases)

---

## 1. Contexte & Objectifs

### 1.1 Contexte

L'utilisateur est **Maître du Jeu (MJ)**  d'une campagne Daggerheart à grande échelle. Cette campagne implique **plusieurs groupes de joueurs distincts** qui évoluent dans un ​**monde partagé et commun**. Les actions de chaque groupe peuvent avoir des répercussions sur le monde et potentiellement sur les autres groupes.

La gestion de cette complexité nécessite un outil centralisé de type ​**wiki interactif**, inspiré de la structure et de l'ergonomie du wiki Fextralife (connu pour Elden Ring, Dark Souls, etc.), adapté à un usage JDR.

### 1.2 Objectifs Principaux

- **Centraliser** toute l'information du monde de jeu (lore, PNJ, lieux, objets, etc.)
- **Suivre l'avancement** de chaque groupe indépendamment dans le monde commun
- **Lier les contenus** entre eux comme dans un vrai wiki (un donjon référence ses ennemis, ses objets, ses PNJ)
- **Gérer les fiches de personnage** au format Daggerheart (joueurs, PNJ, monstres, boss)
- **Intégrer la carte interactive** existante dans la section World
- **Permettre au MJ** de masquer/révéler des informations selon ce que chaque groupe a découvert

### 1.3 Utilisateurs Cibles

|Rôle|Usage|
| ----------------------------| -------------------------------------------------------------|
|Maître du Jeu|Administration complète, édition de tout le contenu|
|(Extension future) Joueurs|Consultation de leur fiche et des informations découvertes|

---

## 2. Analyse du Modèle Fextralife

### 2.1 Structure de Page Type Fextralife

Le wiki Fextralife est organisé autour des principes suivants, que l'on s'inspire pour ce projet :

**Layout principal :**

- Barre de navigation horizontale en haut avec menus déroulants
- Sidebar gauche avec sous-catégories de navigation
- Zone de contenu centrale (80% de la largeur)
- Infobox flottante à droite (stats, image, données clés)
- Section "Notes & Trivia" et "Liens associés" en bas de page

**Pages de type "Entité" (ennemi, objet, lieu) :**

- Image principale + nom + description courte en header
- Tableau de stats (infobox)
- Description détaillée / Lore
- Section "Où trouver" / "Drops" / "Stratégie"
- Liens vers les éléments associés (hyperliens wiki internes)

**Navigation :**

- Menus de premier niveau cliquables avec sous-menus en survol
- Fil d'Ariane (breadcrumb) sur chaque page
- Barre de recherche globale
- Tags/catégories pour filtrer les contenus

### 2.2 Adaptations pour le JDR Multi-Groupes

Par rapport à Fextralife, on ajoute :

- **Couche "Avancement par groupe"**  : chaque lieu/événement/entité peut avoir un état différent selon le groupe
- **Système de spoilers/masquage** : le MJ peut masquer des sections sensibles (révélations, secrets)
- **Historique des sessions** : chaque entrée peut avoir un journal des sessions qui y sont liées
- **Statuts dynamiques** : un PNJ peut être Vivant/Mort/Disparu selon le groupe

---

## 3. Architecture Générale

### 3.1 Stack Technique

|Composant|Technologie|
| -------------------| -------------------------------------------------------|
|Frontend|HTML5 / CSS3 / JavaScript (Vanilla ou React)|
|Backend|Python (Flask) ou Node.js (Express)|
|Base de données|SQLite|
|Carte interactive|Outil existant (à intégrer via iframe ou composant)|
|Hébergement|Local (usage personnel MJ)|

### 3.2 Structure de Fichiers

```
/jdr-wiki/
├── /backend/
│   ├── app.py (ou server.js)
│   ├── /models/           ← Modèles SQLite
│   ├── /routes/           ← API REST
│   └── database.db
├── /frontend/
│   ├── /static/
│   │   ├── /css/
│   │   ├── /js/
│   │   └── /img/
│   ├── /templates/ (ou /components/)
│   └── index.html
├── /map/                  ← Outil carte existant
└── /uploads/              ← Images uploadées
```

### 3.3 Principe des Pages Wiki

Chaque "entité" (PNJ, lieu, objet, monstre…) possède sa propre page avec :

- Un **slug URL** unique : `/wiki/character/npc/aldric-le-forgeron`
- Un **infobox** de données rapides (stats Daggerheart, type, localisation)
- Un **corps de page** en format riche (éditeur WYSIWYG ou Markdown)
- Des **liens internes** automatiques vers d'autres entités

---

## 4. Navigation & Structure des Pages

### 4.1 Barre de Navigation Principale (Top Nav)

```
[ Logo / Nom du Monde ]  [ NEWS ]  [ GÉNÉRAL ]  [ CHARACTER ▼ ]  [ EQUIPMENT ▼ ]  [ WORLD ▼ ]  [ 🔍 Recherche ]
```

Chaque menu peut avoir des sous-menus déroulants. La barre est fixe (sticky) au défilement.

### 4.2 Sous-Menus Détaillés

**CHARACTER ▼**

- Joueurs
- PNJ (Personnages Non-Joueurs)
- Monstres
- Boss
- Créer un personnage

**EQUIPMENT ▼**

- Armes
- Armures
- Objets & Consommables
- Artefacts & Objets Magiques
- Or & Monnaie
- Créer un équipement

**WORLD ▼**

- Carte Interactive
- Régions
- Donjons & Zones
- Villes & Villages
- Points d'intérêt
- Créer un lieu

### 4.3 Sidebar Gauche (par section)

Chaque section possède une sidebar contextuelle avec les sous-catégories et liens rapides. Exemple pour CHARACTER :

```
▼ JOUEURS
   └─ Groupe Alpha
       ├─ Aldric (Warrior L3)
       └─ Mira (Rogue L3)
   └─ Groupe Beta
       ├─ Theron (Wizard L4)
       └─ ...
▼ PNJ
   ├─ Alliés
   ├─ Neutres
   └─ Antagonistes
▼ MONSTRES
   ├─ Tier 1
   ├─ Tier 2
   └─ Boss
```

### 4.4 Fil d'Ariane (Breadcrumb)

```
Wiki > Character > PNJ > Aldric le Forgeron
```

### 4.5 Infobox (à droite du contenu)

Bloc flottant en haut à droite de chaque page avec les informations clés selon le type d'entité :

**Infobox PNJ :**

```
┌─────────────────────┐
│ [IMAGE]             │
│ Nom: Aldric         │
│ Type: PNJ Allié     │
│ Localisation: Forge │
│                     │
│ Statut par Groupe:  │
│ Groupe A: Vivant ✓  │
│ Groupe B: Mort ✗    │
└─────────────────────┘
```

---

## 5. Module NEWS — Dashboard

### 5.1 Description

Page d'accueil principale du wiki. Donne une vue d'ensemble de l'état du monde et de l'avancement de chaque groupe.

### 5.2 Composants du Dashboard

**Bloc 1 — Résumé Mondial**

- Nombre total de groupes actifs
- Date de la dernière session pour chaque groupe
- Événements mondiaux importants en cours

**Bloc 2 — Avancement par Groupe**

- Tableau/cartes avec pour chaque groupe :

  - Nom du groupe + composition (N joueurs)
  - Niveau moyen des joueurs
  - Dernière zone visitée
  - Prochain objectif (si noté)
  - Date de la prochaine session
  - Indicateur de progression globale (barre ou %)

**Bloc 3 — Événements Récents (Journal du Monde)**

- Liste chronologique des événements importants du monde

  - "Groupe Alpha a tué le Dragon de la Tour Nord"
  - "Groupe Beta a libéré la ville de Vernis"
- Filtrable par groupe

**Bloc 4 — Notes du MJ (privées)**

- Zone de texte libre pour notes rapides du MJ
- Rappels, TODO pour prochaine session

**Bloc 5 — Statistiques Globales**

- Nombre de PNJ créés / Vivants / Morts
- Nombre de lieux découverts vs total
- Nombre de sessions jouées par groupe

---

## 6. Module GÉNÉRAL — Lore & Histoire

### 6.1 Description

Section pour tout le contenu narratif du monde : histoire, mythologie, factions, prophéties, chronologie, etc.

### 6.2 Sous-sections

|Sous-section|Description|
| --------------------------| -----------------------------------------|
|Histoire du Monde|Lore général, origines, grandes ères|
|Chronologie|Timeline des événements historiques|
|Factions & Organisations|Guildes, royaumes, cultes, armées|
|Religions & Dieux|Panthéon, croyances, rituels|
|Langues & Cultures|Races/héritages, coutumes|
|Prophéties & Mystères|Éléments narratifs secrets du MJ|

### 6.3 Format de Page "Lore"

- Éditeur de texte riche (Markdown ou WYSIWYG)
- Possibilité d'insérer des images
- Liens internes automatiques vers d'autres pages du wiki
- Système de tags (ex: `#faction`​, `#histoire`​, `#secret`)
- Niveau de visibilité : `Public`​ | `MJ Seulement`​ | `Groupe X Seulement`

---

## 7. Module CHARACTER — Personnages

### 7.1 Types de Personnages

|Type|Description|
| -------------| -------------------------------------------------------|
|Joueur (PC)|Fiche complète Daggerheart, associé à un groupe|
|PNJ|Personnage non-joueur du monde|
|Monstre|Adversaire générique avec stats de combat|
|Boss|Adversaire unique avec lore et mécaniques spéciales|

### 7.2 Fiche de Personnage Joueur (PC) — Daggerheart Complet

La fiche reproduit fidèlement la feuille de personnage Daggerheart :

#### Informations Générales

- Nom, Héritage (Heritage), Pronoms
- Classe (Bard, Druid, Guardian, Ranger, Rogue, Seraph, Sorcerer, Warrior, Wizard)
- Sous-classe (Subclass)
- Niveau (1-10), Tier (1-4), Proficiency

#### Traits (6 caractéristiques)

Chacun avec sa valeur numérique et ses 3 actions associées :

|Trait|Actions|
| -----------| -----------------------------|
|Agility|Sprint, Leap, Maneuver|
|Strength|Lift, Smash, Grapple|
|Finesse|Control, Hide, Tinker|
|Instinct|Perceive, Sense, Navigate|
|Presence|Charm, Perform, Deceive|
|Knowledge|Recall, Analyze, Comprehend|

#### Santé & Résistance

- **HP** : 3 slots (Mark 1 HP / Mark 2 HP / Mark 3 HP)
- **Stress** : N slots selon la classe
- **Evasion** : valeur de base
- **Armor** : Score de base + Seuils de dégâts (Minor / Major / Severe)
- **Hope** : valeur courante

#### Armes (4 emplacements)

Pour chaque arme :

- Nom, Feature (capacité spéciale)
- Trait utilisé + Portée (Melee / Very Close / Close / Far / Very Far)
- Dés de dégâts + Type (phy / mag)
- One-Handed / Two-Handed

Emplacements : Primary, Secondary, Inventory 1, Inventory 2

#### Expériences

- Liste des Experiences avec leur bonus (+1, +2, etc.)
- Utilisation : dépenser 1 Hope pour ajouter une Experience à un jet

#### Inventaire & Or

- Or : Handfuls / Bags / Chest
- Liste d'objets (nom, description, quantité)

#### Domaines & Cartes

- Domaine(s) accessible(s) selon la classe
- Liste des cartes de domaine équipées (spells/capacités)
- Vault (cartes stockées)

#### Feature de Classe

- Description de la feature principale de la classe
- Feature de sous-classe

#### Avancement par Tier

- Tier 2 (niveaux 2-4) : options choisies
- Tier 3 (niveaux 5-7) : options choisies
- Tier 4 (niveaux 8-10) : options choisies
- Multiclass (si applicable)

#### Background & Connexions

- Questions de background répondues
- Connexions avec les autres PJ
- Description physique

### 7.3 Fiche de PNJ

- Nom, Localisation principale, Statut (Vivant/Mort/Disparu/Inconnu)
- Description physique + personnalité
- Rôle dans l'histoire
- Relations avec d'autres PNJ/factions
- **Statut par groupe** : état différent possible selon chaque groupe de joueurs
- Secrets (visibles MJ seulement)
- Lieux fréquentés (liens vers pages World)
- Objets détenus (liens vers pages Equipment)
- Notes de session

### 7.4 Fiche de Monstre

- Nom, Type/Catégorie, Tier (1-4)
- Description & Lore
- Statistiques de combat :

  - HP (seuils Minor/Major/Severe)
  - Evasion, Armor Score
  - Attaque principale : Trait + Portée + Dés + Type
  - Attaques/capacités spéciales
  - Résistances/Vulnérabilités
  - Niveau de Difficulté (pour jets d'action)
- Drops / Récompenses
- Localisation(s)
- Comportement / Tactiques

### 7.5 Fiche de Boss

Tout ce qui est dans la fiche Monstre, plus :

- Phase de combat (mécaniques par phase)
- Dialogue / Lore narratif
- Conditions de victoire/défaite spéciales
- Connexions avec l'histoire principale
- Statut "Vaincu par" (quel groupe, quelle session)

### 7.6 Association aux Groupes

Chaque PC est assigné à exactement un groupe. Les PNJ peuvent avoir un **statut différent par groupe** (voir section 11).

---

## 8. Module EQUIPMENT — Équipements

### 8.1 Catégories d'Équipements

|Catégorie|Description|
| -----------------------| ---------------------------------------|
|Armes|Toutes les armes utilisables|
|Armures|Toutes les armures portables|
|Objets Consommables|Potions, nourriture, parchemins|
|Artefacts Magiques|Objets uniques à puissance narrative|
|Équipement Général|Cordes, torches, outils|
|Cartes de Domaine|Sorts/capacités Daggerheart|

### 8.2 Fiche d'une Arme

- Nom, Illustration
- Trait utilisé (Agility / Strength / Finesse / Instinct / Presence / Knowledge)
- Portée (Melee / Very Close / Close / Far / Very Far)
- Dés de dégâts (d4, d6, d8, d10, d12) + modificateur + Type (phy/mag)
- Une ou deux mains (Burden)
- Feature (capacité spéciale de l'arme)

  - Ex: "Quick: Marquer 1 Stress pour attaquer une seconde cible"
  - Ex: "Paired: +2 dégâts arme primaire à portée Melee"
- Rareté / Valeur en or
- Localisation(s) où la trouver
- Personnages qui la possèdent (liens)

### 8.3 Fiche d'une Armure

- Nom, Illustration
- Seuils de dégâts de base : Minor threshold / Major threshold
- Score d'armure de base
- Feature spéciale (ex: "Heavy: −1 Evasion" / "Flexible: +1 Evasion")
- Rareté / Valeur
- Localisation(s)

### 8.4 Fiche d'un Objet / Consommable

- Nom, Type, Illustration
- Description / Effets
- Utilisation (action, réaction, passif)
- Valeur
- Localisation(s)

### 8.5 Fiche d'une Carte de Domaine (Sort)

- Nom, Domaine (Arcana, Blade, Bone, Codex, Grace, Midnight, Sage, Splendor, Valor)
- Niveau (1-9)
- Type (Sort actif / Passif / Réaction)
- Description de l'effet
- Classes pouvant y accéder

---

## 9. Module WORLD — Monde & Carte

### 9.1 Types de Lieux

|Type|Description|
| ---------------------| --------------------------------|
|Région|Grande zone géographique|
|Ville/Village|Zone habitée avec PNJ|
|Donjon|Zone d'exploration structurée|
|Château/Forteresse|Structure majeure|
|Sanctuaire/Temple|Lieu religieux|
|Point d'intérêt|Lieu notable sur la carte|
|Route/Passage|Connexion entre zones|

### 9.2 Fiche d'un Lieu

**Informations générales :**

- Nom, Type, Région parente
- Illustration / Carte du lieu
- Description générale (atmosphère, apparence)
- Lore / Histoire

**Contenu du lieu :**

- PNJ présents (liens Character)
- Monstres/Ennemis (liens Character)
- Boss (liens Character)
- Objets trouvables (liens Equipment)
- Événements / Quêtes associées

**Connexions géographiques :**

- Lieux adjacents (liens bidirectionnels)
- Position sur la carte (coordonnées pour l'outil carte)

**Avancement par Groupe :**

- État du lieu selon chaque groupe (voir section 11)
- Ex: Groupe A : "Donjon exploré" | Groupe B : "Non découvert"
- Notes spécifiques à chaque groupe

**Sections MJ (masquées) :**

- Secrets cachés dans le lieu
- Pièges non révélés
- Connexions à l'intrigue principale

### 9.3 Sous-page "Carte Interactive"

Intégration de l'outil de carte existant dans le menu World \> Carte Interactive. Voir Section 15.

---

## 10. Système de Liaisons (Links)

### 10.1 Principe

Inspiré du système wiki de Fextralife : ​**tout peut être lié à tout**. Un texte descriptif peut contenir des liens cliquables vers d'autres pages du wiki.

Syntaxe dans l'éditeur : `[[Nom de l'Entité]]` → lien automatique

### 10.2 Types de Liaisons

|Source|Destination|Exemple|
| ---------------------| ---------------------------------| ------------------------------------|
|Lieu → Personnage|PNJ présents dans un lieu|Donjon → Boss Cerbères|
|Lieu → Objet|Objets trouvables dans un lieu|Château → Épée Légendaire|
|Personnage → Lieu|Localisation d'un PNJ|Aldric → Forêt de Verin|
|Personnage → Objet|Objet détenu/offert par un PNJ|Marchant → Armure d'Acier|
|Objet → Personnage|Drops de monstres|Gobelin → Dague rouillée|
|Quête → tout|Tout ce qu'implique une quête|Quête → PNJ + Lieu + Récompense|

### 10.3 Liens Bidirectionnels Automatiques

Quand on lie A → B, la page de B doit automatiquement référencer "Apparaît dans : A" dans sa section de liens associés.

### 10.4 Recherche et Autocomplétion

Dans l'éditeur, quand on tape `[[`, une liste déroulante propose les entités correspondant à la recherche pour faciliter la liaison.

---

## 11. Gestion Multi-Groupes

### 11.1 Concept Central

Le monde est ​**unique et partagé**​, mais chaque groupe a sa **propre perspective** dessus. Le MJ doit pouvoir enregistrer l'état du monde du point de vue de chaque groupe.

### 11.2 Structure d'un Groupe

**Données d'un groupe :**

- Nom du groupe (ex: "Les Lames d'Argent")
- Couleur d'identification (pour différencier visuellement)
- Liste des joueurs (liens vers fiches PC)
- Niveau moyen
- Date de création, date de dernière session
- Notes privées du MJ pour ce groupe

### 11.3 État d'une Entité par Groupe

Pour chaque entité (Lieu, PNJ, etc.), il peut exister un **override d'état par groupe** :

**Table** **​`entity_group_state`​**​  **:**

- ​`entity_id`​ + `entity_type`​ + `group_id`
- ​`status` : selon le type (Découvert/Non découvert pour un lieu, Vivant/Mort pour un PNJ)
- ​`notes` : notes spécifiques au groupe sur cette entité
- ​`discovery_session` : numéro de session lors de la découverte

### 11.4 Dashboard Multi-Groupes

Vue comparative montrant pour chaque groupe :

```
                    | Groupe Alpha | Groupe Beta | Groupe Gamma |
Donjon du Roi Noir  | ✓ Exploré   | ? Partiel  | ✗ Inconnu   |
Boss Cerbère        | ✓ Vaincu    | ✗ Vivant   | ✗ Inconnu   |
PNJ Aldric          | Vivant      | Mort        | Inconnu     |
```

### 11.5 Filtre par Groupe

Dans la barre de navigation, un sélecteur permet de ​**filtrer la vue par groupe**. Quand un groupe est sélectionné, les informations affichées reflètent ce que CE groupe sait/a découvert.

### 11.6 Journal de Session

Pour chaque groupe, un journal chronologique des sessions :

- N° session, date
- Résumé libre (éditeur texte)
- Événements importants tagués (liens vers entités concernées)
- XP gagnée / avancement de niveau
- Objets acquis
- PNJ rencontrés / tués

---

## 12. Système Daggerheart — Intégration Règles

### 12.1 Classes Disponibles

|Classe|Domaines|Hope de départ|
| ----------| -------------------| -----------------|
|Bard|Grace + Codex|10|
|Druid|Sage + Arcana|10|
|Guardian|Valor + Blade|9|
|Ranger|Bone + Sage|12|
|Rogue|Midnight + Grace|12|
|Seraph|Splendor + Valor|9|
|Sorcerer|Arcana + Midnight|10|
|Warrior|Blade + Bone|11|
|Wizard|Codex + Splendor|11|

### 12.2 Domaines

9 domaines de cartes disponibles : Arcana, Blade, Bone, Codex, Grace, Midnight, Sage, Splendor, Valor

### 12.3 Héritages

Types de personnages selon le lore (à définir par le MJ). Pas de liste fixe dans Daggerheart core — le MJ crée ses héritages.

### 12.4 Système de Tiers

|Tier|Niveaux|Proficiency bonus|
| ------| ---------------| -------------------|
|1|Niveau 1|base|
|2|Niveaux 2–4|+1 à niveau 2|
|3|Niveaux 5–7|+1 à niveau 5|
|4|Niveaux 8–10|+1 à niveau 8|

### 12.5 Calcul des Seuils de Dégâts

​`Seuil effectif = Seuil de base + Niveau du personnage`

L'application calcule automatiquement les seuils mis à jour lors des montées de niveau.

### 12.6 Compagnons (Ranger)

Le Ranger peut avoir un compagnon animal avec :

- Nom, description, illustration
- 2 Experiences de compagnon (démarrant à +2)
- Dé de dégât (d6 → d8 → d10 → d12 selon upgrades)
- Portée d'attaque
- Stress slots
- Evasion
- Options d'amélioration choisies (Intelligent, Armored, Vicious, etc.)

### 12.7 Beastforms (Druid)

Base de données des Beastforms par Tier :

- Tier 1 : Agile Scout, Household Friend, Nimble Grazer, Pack Predator, Aquatic Scout, Stalking Arachnid
- Tier 2 : Armored Sentry, Powerful Beast, Mighty Strider, Striking Serpent, Pouncing Predator, Winged Beast
- Tier 3 : Great Predator, Mighty Lizard, Great Winged Beast, Aquatic Predator, Legendary Beast, Legendary Hybrid
- Tier 4 : Massive Behemoth, Terrible Lizard, Mythic Aerial Hunter, Epic Aquatic Beast, Mythic Beast, Mythic Hybrid

---

## 13. Schéma de Base de Données SQLite

### 13.1 Tables Principales

```sql
-- Groupes de joueurs
CREATE TABLE groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#4a90d9',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_session_date DATE,
    notes TEXT
);

-- Sessions par groupe
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES groups(id),
    session_number INTEGER NOT NULL,
    session_date DATE,
    title TEXT,
    summary TEXT,
    notes_gm TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Joueurs / Personnages Joueurs
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES groups(id),
    player_name TEXT,          -- Nom du joueur réel
    character_name TEXT NOT NULL,
    heritage TEXT,
    pronouns TEXT,
    class TEXT NOT NULL,       -- Bard, Druid, Guardian, etc.
    subclass TEXT,
    level INTEGER DEFAULT 1,
    proficiency INTEGER DEFAULT 1,
    -- Traits
    agility INTEGER DEFAULT 0,
    strength INTEGER DEFAULT 0,
    finesse INTEGER DEFAULT 0,
    instinct INTEGER DEFAULT 0,
    presence INTEGER DEFAULT 0,
    knowledge INTEGER DEFAULT 0,
    -- Santé
    hp_slots INTEGER DEFAULT 3,
    hp_marks INTEGER DEFAULT 0,
    stress_slots INTEGER DEFAULT 6,
    stress_marks INTEGER DEFAULT 0,
    evasion INTEGER DEFAULT 10,
    -- Armor
    armor_score INTEGER DEFAULT 0,
    armor_threshold_minor INTEGER DEFAULT 0,
    armor_threshold_major INTEGER DEFAULT 0,
    armor_slots INTEGER DEFAULT 0,
    armor_slots_marked INTEGER DEFAULT 0,
    -- Hope
    hope_current INTEGER DEFAULT 0,
    hope_start INTEGER DEFAULT 10,
    -- Background
    background_text TEXT,
    description TEXT,
    notes TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expériences des personnages
CREATE TABLE character_experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER REFERENCES players(id),
    name TEXT NOT NULL,
    bonus INTEGER DEFAULT 2,
    is_companion_exp BOOLEAN DEFAULT 0
);

-- Armes des personnages
CREATE TABLE character_weapons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER REFERENCES players(id),
    slot TEXT CHECK(slot IN ('primary','secondary','inventory1','inventory2')),
    weapon_id INTEGER REFERENCES equipment(id),
    is_active BOOLEAN DEFAULT 1
);

-- PNJ
CREATE TABLE npcs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'neutral', -- ally, neutral, antagonist
    location_id INTEGER REFERENCES locations(id),
    description TEXT,
    lore TEXT,
    personality TEXT,
    secrets TEXT,    -- visible MJ seulement
    image_url TEXT,
    is_unique BOOLEAN DEFAULT 0,
    default_status TEXT DEFAULT 'alive', -- alive, dead, missing, unknown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Monstres
CREATE TABLE monsters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tier INTEGER DEFAULT 1,
    category TEXT,
    description TEXT,
    lore TEXT,
    -- Stats combat
    hp_threshold_minor INTEGER,
    hp_threshold_major INTEGER,
    hp_threshold_severe INTEGER,
    evasion INTEGER DEFAULT 10,
    armor_score INTEGER DEFAULT 0,
    -- Attaque principale
    attack_name TEXT,
    attack_trait TEXT,
    attack_range TEXT,
    attack_damage_dice TEXT,
    attack_damage_type TEXT CHECK(attack_damage_type IN ('phy','mag')),
    attack_feature TEXT,
    -- Capacités spéciales
    special_abilities TEXT,  -- JSON array
    resistances TEXT,
    vulnerabilities TEXT,
    difficulty INTEGER DEFAULT 12,
    image_url TEXT,
    is_boss BOOLEAN DEFAULT 0,
    secrets TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Équipements
CREATE TABLE equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT CHECK(category IN ('weapon','armor','consumable','artifact','general','domain_card')),
    description TEXT,
    lore TEXT,
    -- Armes
    weapon_trait TEXT,
    weapon_range TEXT,
    weapon_damage_dice TEXT,
    weapon_damage_type TEXT,
    weapon_hands INTEGER DEFAULT 1,
    weapon_feature TEXT,
    -- Armures
    armor_threshold_base_minor INTEGER,
    armor_threshold_base_major INTEGER,
    armor_score_base INTEGER,
    armor_feature TEXT,
    -- Cartes de domaine
    domain TEXT,
    domain_level INTEGER,
    domain_effect TEXT,
    -- Commun
    rarity TEXT DEFAULT 'common',
    value_handfuls INTEGER DEFAULT 0,
    value_bags INTEGER DEFAULT 0,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lieux / Locations
CREATE TABLE locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT CHECK(type IN ('region','city','village','dungeon','castle','temple','poi','route')),
    parent_id INTEGER REFERENCES locations(id),
    description TEXT,
    lore TEXT,
    atmosphere TEXT,
    secrets TEXT,
    map_x REAL,  -- coordonnées pour la carte
    map_y REAL,
    image_url TEXT,
    is_discovered_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Connexions entre lieux
CREATE TABLE location_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_from INTEGER REFERENCES locations(id),
    location_to INTEGER REFERENCES locations(id),
    travel_description TEXT,
    UNIQUE(location_from, location_to)
);

-- Lore / Articles généraux
CREATE TABLE lore_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,  -- history, factions, religion, language, prophecy
    content TEXT,
    visibility TEXT DEFAULT 'public', -- public, gm_only, group_specific
    visible_to_group INTEGER REFERENCES groups(id),
    tags TEXT,  -- JSON array de tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 13.2 Tables de Liaisons (Links)

```sql
-- Liens génériques entre entités
CREATE TABLE wiki_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL,  -- 'location','npc','monster','equipment','lore'
    source_id INTEGER NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    link_label TEXT,  -- description du lien (ex: "Se trouve dans", "Drops")
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_type, source_id, target_type, target_id)
);

-- Présence de PNJ dans des lieux
CREATE TABLE location_npcs (
    location_id INTEGER REFERENCES locations(id),
    npc_id INTEGER REFERENCES npcs(id),
    notes TEXT,
    PRIMARY KEY(location_id, npc_id)
);

-- Présence de monstres dans des lieux
CREATE TABLE location_monsters (
    location_id INTEGER REFERENCES locations(id),
    monster_id INTEGER REFERENCES monsters(id),
    quantity TEXT DEFAULT 'plusieurs',
    notes TEXT,
    PRIMARY KEY(location_id, monster_id)
);

-- Équipements trouvables dans des lieux
CREATE TABLE location_equipment (
    location_id INTEGER REFERENCES locations(id),
    equipment_id INTEGER REFERENCES equipment(id),
    acquisition_method TEXT,  -- 'drop', 'chest', 'shop', 'reward'
    notes TEXT,
    PRIMARY KEY(location_id, equipment_id)
);

-- Drops de monstres
CREATE TABLE monster_drops (
    monster_id INTEGER REFERENCES monsters(id),
    equipment_id INTEGER REFERENCES equipment(id),
    drop_rate TEXT DEFAULT 'commun',
    notes TEXT,
    PRIMARY KEY(monster_id, equipment_id)
);
```

### 13.3 Tables d'État Multi-Groupes

```sql
-- État d'un lieu pour un groupe spécifique
CREATE TABLE group_location_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES groups(id),
    location_id INTEGER REFERENCES locations(id),
    status TEXT DEFAULT 'undiscovered',
    -- undiscovered, partially_explored, fully_explored, cleared
    notes TEXT,  -- notes spécifiques au groupe
    discovery_session_id INTEGER REFERENCES sessions(id),
    UNIQUE(group_id, location_id)
);

-- État d'un PNJ pour un groupe spécifique
CREATE TABLE group_npc_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES groups(id),
    npc_id INTEGER REFERENCES npcs(id),
    status TEXT DEFAULT 'unknown',
    -- unknown, met, friendly, hostile, dead, missing
    relationship_notes TEXT,
    UNIQUE(group_id, npc_id)
);

-- État d'un monstre/boss pour un groupe
CREATE TABLE group_monster_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES groups(id),
    monster_id INTEGER REFERENCES monsters(id),
    status TEXT DEFAULT 'unknown',
    -- unknown, encountered, defeated
    defeat_session_id INTEGER REFERENCES sessions(id),
    notes TEXT,
    UNIQUE(group_id, monster_id)
);

-- Événements du Journal du Monde
CREATE TABLE world_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES groups(id),
    session_id INTEGER REFERENCES sessions(id),
    event_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,  -- combat, discovery, story, death, achievement
    related_location_id INTEGER REFERENCES locations(id),
    related_npc_id INTEGER REFERENCES npcs(id),
    related_monster_id INTEGER REFERENCES monsters(id),
    is_world_changing BOOLEAN DEFAULT 0  -- impacte le monde pour tous
);
```

### 13.4 Table de Configuration

```sql
-- Configuration générale du wiki
CREATE TABLE wiki_config (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT
);

-- Insertions initiales
INSERT INTO wiki_config VALUES ('world_name', 'Mon Monde', 'Nom du monde de jeu');
INSERT INTO wiki_config VALUES ('gm_name', 'MJ', 'Nom du Maître du Jeu');
INSERT INTO wiki_config VALUES ('game_system', 'Daggerheart', 'Système de règles utilisé');
INSERT INTO wiki_config VALUES ('theme_color', '#1a1a2e', 'Couleur principale du thème');
```

---

## 14. UI/UX — Charte Graphique

### 14.1 Inspiration Fextralife

Le design s'inspire du wiki Fextralife avec :

- **Thème sombre** (dark mode) dominant
- Couleurs principales : fond sombre (#1a1a2e ou #0d1117), accents dorés/ambrés pour l'aspect fantasy
- Police : Inter ou Roboto pour le texte courant, police serif décorative pour les titres (optionnel)
- Navigation claire avec hover effects

### 14.2 Palette de Couleurs

|Élément|Couleur|
| ------------------------------------------| ------------------|
|Fond principal|​`#0f1117`|
|Fond secondaire (sidebar, infobox)|​`#1a1d2e`|
|Fond carte/infobox|​`#1e2236`|
|Accent principal (liens actifs, boutons)|​`#c8a846`(or/ambre)|
|Accent secondaire|​`#4a90d9`(bleu steel)|
|Texte principal|​`#e8e8e8`|
|Texte secondaire|​`#9ea3b2`|
|Bordures|​`#2d3148`|
|Succès / Vivant|​`#4caf50`|
|Danger / Mort|​`#f44336`|
|Inconnu / Neutre|​`#9e9e9e`|

### 14.3 Couleurs par Groupe

Chaque groupe a une couleur unique assignée, utilisée pour le tag du groupe dans tout le wiki :

- Groupe 1 : Bleu (#4a90d9)
- Groupe 2 : Vert (#43a047)
- Groupe 3 : Rouge (#e53935)
- Groupe 4 : Violet (#7b1fa2)
- Groupe 5 : Orange (#fb8c00)
- (couleur personnalisable par le MJ)

### 14.4 Composants UI

**Navigation Top :**  sticky, fond semi-transparent avec backdrop-blur, liens avec underline animé au hover

**Sidebar :**  largeur fixe 260px, collapsible sur mobile, sous-catégories en accordéon

**Infobox :**  flottante à droite sur desktop, pleine largeur en haut sur mobile. Coins arrondis, border légère, fond légèrement plus clair

**Éditeur de contenu :**  éditeur Markdown avec prévisualisation, ou éditeur WYSIWYG léger (ex: Quill.js)

**Tags de statut par groupe :**  petits badges colorés inline avec la couleur du groupe

**Breadcrumb :**  barre fine sous la navbar, texte secondaire avec séparateur `>`

### 14.5 Responsive Design

- Desktop (\>1200px) : Layout 3 colonnes (sidebar + contenu + infobox)
- Tablet (768-1200px) : Layout 2 colonnes (sidebar + contenu, infobox en bas)
- Mobile (\<768px) : Layout 1 colonne, sidebar en drawer hamburger

---

## 15. Intégration de la Carte Interactive

### 15.1 Principes d'Intégration

L'outil de carte existant est intégré dans la page `World > Carte Interactive`. Les options d'intégration selon l'architecture :

**Option A — Iframe** : La carte est servie comme une sous-application et intégrée via `<iframe>` dans la page World. Simple, pas de conflit.

**Option B — Composant intégré** : Si la carte est en JavaScript pur, ses fichiers sont inclus dans le projet et montés dans un div dédié.

**Option C — Lien externe** : Bouton "Ouvrir la carte" qui ouvre l'outil dans un nouvel onglet ou une modale plein écran.

### 15.2 Communication Wiki ↔ Carte

Pour lier la carte au wiki, il est souhaitable que :

- Cliquer sur un point de la carte **ouvre la page wiki** du lieu correspondant
- Depuis une page de lieu dans le wiki, un bouton  **"Voir sur la carte"**  centre la carte sur ce lieu

**Données partagées :** La table `locations`​ contient des champs `map_x`​ et `map_y` avec les coordonnées de chaque lieu sur la carte. Ces coordonnées permettent la synchronisation.

### 15.3 Overlay Multi-Groupes sur la Carte

Si la carte le permet, afficher des indicateurs de progression par groupe :

- Zones explorées par un groupe (overlay coloré avec la couleur du groupe)
- Filtres : "Afficher progression Groupe Alpha" / "Afficher tout"

---

## 16. Fonctionnalités Transversales

### 16.1 Recherche Globale

- Barre de recherche dans la navbar
- Recherche en temps réel (debounce 300ms)
- Résultats catégorisés : Personnages / Lieux / Équipements / Lore
- Aperçu rapide (preview card) au survol d'un résultat

### 16.2 Éditeur de Contenu Wiki

Tous les champs de description/lore utilisent un éditeur unifié supportant :

- **Markdown** (syntaxe simple)
- **Liens internes** : `[[Nom de l'entité]]` → lien wiki automatique
- **Blocs secrets** : `:::secret\nContenu caché\n:::` → masqué aux joueurs
- **Images** : upload et insertion inline
- **Tableaux** : syntaxe Markdown standard

### 16.3 Système de Tags

Toute entité peut avoir des tags libres pour faciliter la navigation et la recherche :

- Tags de contenu : `#magie`​, `#combat`​, `#politique`​, `#mystère`
- Tags de statut : `#important`​, `#résolu`​, `#en-cours`
- Tags de lore : `#prophétie`​, `#faction-X`

### 16.4 Historique des Modifications

Chaque modification d'une fiche est enregistrée avec :

- Date/heure
- Champ modifié
- Ancienne valeur / Nouvelle valeur Permet de retrouver des informations en cas d'erreur.

### 16.5 Export

- Export PDF d'une fiche (pour impression)
- Export JSON de la base de données (sauvegarde)
- Export de la fiche de personnage en format PDF imprimable (style feuille Daggerheart)

### 16.6 Images

- Upload d'images depuis le PC
- Stockage local dans `/uploads/`
- Redimensionnement automatique (max 800x800px pour infobox, max 1920px pour bannières)

### 16.7 Navigation Rapide (Quick Access)

Barre de raccourcis configurable par le MJ :

- Liens rapides vers les groupes/joueurs les plus utilisés
- Accès direct au journal de la dernière session

---

## 17. Contraintes Techniques

### 17.1 Contraintes Fonctionnelles

- Application **locale** (usage personnel, pas de multi-utilisateurs simultanés requis initialement)
- SQLite comme seule base de données (pas de PostgreSQL/MySQL)
- Pas d'authentification complexe requise (usage MJ seul)
- L'outil de carte existant doit être intégré sans être recodé
- Compatibilité navigateurs modernes (Chrome, Firefox, Edge)

### 17.2 Performance

- Chargement d'une page wiki \< 500ms
- Recherche en temps réel \< 100ms
- Base de données SQLite optimisée avec index sur les champs fréquemment recherchés (name, slug, type)

### 17.3 Scalabilité

Le système doit supporter sans problème :

- 10+ groupes simultanés
- 500+ entités (PNJ, lieux, objets, monstres)
- 1000+ sessions enregistrées
- 50+ personnages joueurs

### 17.4 Index SQLite Recommandés

```sql
CREATE INDEX idx_players_group ON players(group_id);
CREATE INDEX idx_npcs_location ON npcs(location_id);
CREATE INDEX idx_wiki_links_source ON wiki_links(source_type, source_id);
CREATE INDEX idx_wiki_links_target ON wiki_links(target_type, target_id);
CREATE INDEX idx_group_location ON group_location_state(group_id);
CREATE INDEX idx_world_events_group ON world_events(group_id);
CREATE INDEX idx_locations_parent ON locations(parent_id);
```

---

## 18. Planning de Développement (Phases)

### Phase 1 — Fondations (MVP)

**Objectif : Un wiki fonctionnel basique**

- Mise en place du backend (Flask/Express + SQLite)
- Structure de navigation (top nav + sidebar)
- Module CHARACTER : fiches PNJ et Monstres (CRUD)
- Module WORLD : fiches de Lieux (CRUD)
- Liaisons basiques entre entités
- Design dark theme de base

### Phase 2 — Personnages Joueurs

**Objectif : Fiches Daggerheart complètes**

- Fiche PC complète avec tous les champs Daggerheart
- Gestion des Groupes
- Association PC ↔ Groupe
- Module Equipment complet
- Calculs automatiques (seuils de dégâts par niveau)

### Phase 3 — Multi-Groupes & Dashboard

**Objectif : La valeur différenciante de l'outil**

- Système d'état par groupe (group\_\*\_state)
- Dashboard NEWS avec vue d'ensemble
- Journal de sessions
- Journal du Monde (events)
- Filtre par groupe dans la navigation

### Phase 4 — Intégration Carte & Finitions

**Objectif : Intégration complète et UX finalisée**

- Intégration de la carte interactive dans World
- Communication bidirectionnelle Carte ↔ Wiki
- Recherche globale avancée
- Export PDF des fiches
- Historique des modifications
- Module GÉNÉRAL (Lore)
- Optimisation des performances

### Phase 5 — Extensions (Optionnel)

- Mode "Vue Joueur" (accès limité par groupe)
- Export de la feuille de personnage Daggerheart en PDF imprimable
- Overlay multi-groupes sur la carte
- Application mobile (PWA)

---

## Annexe A — Récapitulatif des Entités

|Entité|Table|Champs clés|
| -------------------| -------| -----------------------------------------------------|
|Groupe|​`groups`|name, color, last\_session\_date|
|Session|​`sessions`|group\_id, session\_number, summary|
|Joueur (PC)|​`players`|group\_id, class, level, tous traits Daggerheart|
|PNJ|​`npcs`|name, type, location\_id, default\_status|
|Monstre/Boss|​`monsters`|tier, stats combat, is\_boss|
|Équipement|​`equipment`|category, stats selon type|
|Lieu|​`locations`|type, parent\_id, map\_x/y|
|Article Lore|​`lore_articles`|category, visibility, content|
|Lien Wiki|​`wiki_links`|source\_type+id, target\_type+id|
|État Lieu/Groupe|​`group_location_state`|status, notes|
|État PNJ/Groupe|​`group_npc_state`|status, relationship\_notes|
|Événement Monde|​`world_events`|group\_id, type, is\_world\_changing|

---

## Annexe B — Exemples de Flux Typiques

### Flux : Créer un Donjon avec son contenu

1. Créer le lieu `Donjon des Cendres` (type: dungeon, parent: Région Nordique)
2. Créer le monstre `Squelette Gardien` (tier 1, stats)
3. Créer le boss `Lich de Cendres`​ (is\_boss: true)
4. Créer l'équipement `Épée Maudite` (weapon)
5. Lier : `location_monsters` → Donjon + Squelette
6. Lier : `location_monsters` → Donjon + Lich
7. Lier : `monster_drops` → Lich + Épée Maudite
8. Coordonnées map\_x/map\_y du donjon → visible sur carte

### Flux : Session de jeu (Groupe Alpha explore le donjon)

1. Créer une Session pour Groupe Alpha (session #5)
2. Mettre à jour `group_location_state`​ : Donjon → "fully\_explored" pour Groupe Alpha
3. Mettre à jour `group_monster_state` : Lich → "defeated" pour Groupe Alpha
4. Ajouter un `world_event` : "Groupe Alpha a vaincu le Lich de Cendres"
5. Mettre à jour la fiche PC : XP, objets obtenus, HP actuels

---

*Document rédigé pour un usage exclusivement privé en tant qu'outil de gestion JDR.Daggerheart © Darrington Press 2025. Ce projet n'est pas affilié à Darrington Press.*
