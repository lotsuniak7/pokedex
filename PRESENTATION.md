# Pokédex Full-Stack
Application complète de gestion Pokémon – Frontend + Backend moderne

<p align="center">
  <img src="https://images.unsplash.com/photo-1613771404785-9b3b3b3b3b3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Pokémon Banner" width="800"/>
  <br/>
  <em>Un Pokédex moderne avec authentification, rôles, sons de Pokémon et admin complète</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Pinia-FFDD57?style=for-the-badge&logo=pinia&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

## Fonctionnalités principales

- Pokédex complet consultable (tous les Pokémon + détails)
- Inscription / Connexion sécurisée (JWT)
- Profil de dresseur : marquer les Pokémon **vus** et **capturés**
- Système de rôles : **Utilisateur** vs **Administrateur**
- Interface d’administration complète **CRUD** pour gérer les Pokémon
- Recherche dynamique en temps réel + pagination intelligente
- Cris des Pokémon joués au clic
- Synthèse vocale (Web Speech API) – le nom du Pokémon est prononcé
- Animations fluides, transitions cinématiques et effets au login
- Documentation interactive de l’API via **Swagger** (`/api-docs`)

## 🛠️ Stack Technique

### Backend (API REST)
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose** (ODM)
- Authentification → **JWT** + hachage **bcrypt**
- Contrôle d’accès basé sur les rôles (**RBAC**)
- Validation des données
- Documentation auto-générée → **Swagger / OpenAPI**
- Tests d’intégration → **Jest** + **Supertest**

### Frontend (Interface réactive)
- **Vue.js 3** → Composition API + `<script setup>`
- Gestion d’état → **Pinia** (modules auth / pokemons / trainer)
- Navigation protégée → **Vue Router** + Navigation Guards
- Requêtes HTTP → **Axios** + intercepteurs (token auto, gestion 401)
- Animations CSS + transitions Vue
- Web Speech API + lecture des cris Pokémon

