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

Deux options s’offrent à vous :



### Option A : Utiliser les données fournies (Recommandé)



```bash
cd mongo/bin
./mongod --dbpath "../data"

```

---

### Option B : Utilisation votre propre MongoDB

D'abord lancez le MongoDB

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

## 👤 Comptes de test

Vous pouvez utiliser les comptes suivants pour tester l’application :

### Administrateur

* **Identifiant :** `root`
* **Mot de passe :** `root`

### Utilisateur

* **Identifiant :** `ivan`
* **Mot de passe :** `ivan`

---

## 🎉 Application prête !

Si toutes les étapes ont été suivies correctement :

* ✅ Le backend fonctionne sur le port **3000**
* ✅ Le frontend fonctionne sur le port **5173**
* ✅ La base MongoDB est connectée et opérationnelle

Vous pouvez maintenant utiliser l’application localement.