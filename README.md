# 🏃 Manuel d’installation et de lancement

Ce dépôt contient l’intégralité du projet (**Backend** et **Frontend**).  
Suivez attentivement les étapes ci-dessous pour déployer l’application localement.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d’avoir installé :

### Node.js (version 18 ou supérieure recommandée)

Vérifier si Node.js est déjà installé :

```bash
node -v
````

Si Node.js n’est pas installé :

#### 🔹 Sur Windows

Téléchargez et installez depuis :
[https://nodejs.org](https://nodejs.org)

#### 🔹 Sur macOS (avec Homebrew)

```bash
brew install node
```

#### 🔹 Sur Ubuntu / Debian

```bash
sudo apt update
sudo apt install nodejs npm -y
```

---

## 1. Installation des dépendances

Ouvrez **deux terminaux distincts**.

### 🔹 Backend

```bash
cd pokedex
npm install
````

### 🔹 Frontend

```bash
cd frontend
npm install
```

---

## 2. Préparation de la base de données

D'abord lancez le MongoDB
```bash
./mongod --dbpath "../data"

```

Aprés pour fournir la base, il vous faudra de lancer un script qui permet de :

* Récupérer automatiquement les **151 premiers Pokémon** depuis l’API officielle (PokéAPI)
* Traduire les données en français
* Insérer les données dans MongoDB

Assurez-vous que MongoDB est lancé, puis exécutez dans le dossier racine :

```bash
node seed.js
```

---

## 3. Lancement de l’application

### ▶ Étape 1 : Lancer le Backend

Dans le dossier racine

```bash
npm start
```

Le serveur sera accessible à l’adresse :

```
http://localhost:3000
```

Documentation API disponible sur :

```
http://localhost:3000/api-docs
```

---

### ▶ Étape 2 : Lancer le Frontend

```bash
cd frontend
npm run dev
```

L’application sera accessible à :

```
http://localhost:5173
```

*(ou sur le port indiqué par Vite dans le terminal)*

---

## 👤 Compte Admin de test

Vous pouvez utiliser le compte suivant pour tester l’application en tant qu'admin:

### Administrateur

* **Identifiant :** `admin`
* **Mot de passe :** `admin`

---

## 🎉 Application prête !

Si toutes les étapes ont été suivies correctement :

* ✅ Le backend fonctionne sur le port **3000**
* ✅ Le frontend fonctionne sur le port **5173**
* ✅ La base MongoDB est connectée et opérationnelle

Vous pouvez maintenant utiliser l’application localement.



## Exécution des tests

Il est fortement recommandé de lancer les tests pour s'assurer que l'environnement est prêt.

### 🔹 Tests Backend (Unitaires & API)

Assurez-vous que MongoDB est lancé, puis dans le dossier pokedex :

```bash
npm test

npm run test:coverage
```

### 🔹 Tests Frontend (E2E avec Playwright)

Si vous lancez les tests pour la première fois, installez d'abord les navigateurs de test :

```bash
npx playwright install
```

Ensuite, lancez les tests (le frontend doit être en cours d'exécution npm run dev) :

```bash
npx playwright test
```