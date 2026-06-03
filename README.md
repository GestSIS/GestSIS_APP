[![CI](https://github.com/GestSIS/GestSIS_APP/actions/workflows/main.yml/badge.svg)](https://github.com/GestSIS/GestSIS_APP/actions/workflows/main.yml)

# GestSIS_APP

Application web pour GestSIS

## Installation

Effectuer les commandes ci-dessous pour lancer le serveur de développement.
Il est possible de configurer l'URL de l'api et du serveur d'authentification dans le fichier `.env.local`!

### Installation des dépendances
```bash
yarn install
```

### Configuration du fichier .env.local
```bash
cp .env.example .env.local
```

### Serveur de développement (compilation et hot-reload)
```bash
yarn dev
```

### Lancer les tests
```bash
yarn test
```

### Linter et résolution des problèmes liés
```bash
yarn lint
```

### Compilation et minification pour mise en production
```bash
yarn build
```

### Aperçu de la version de production
```bash
yarn preview
```

### Développement dans une machine virtuelle
Si le serveur de développement est lancé dans une machine virtuelle, mais que l'accès se fait depuis l'hôte, il est nécessaire de suivre les étapes suivantes :
- dans `.env.local`, remplacer `127.0.0.1` par l'adresse réelle de la machine virtuelle
- dans `vite.config.js`, ajouter la configuration du serveur :

```js
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // ou l'adresse spécifique de votre VM
    port: 5173,
  }
});
```

### Configuration
Voir [Configuration Vite](https://vitejs.dev/config/).
