[![Build Status](https://travis-ci.com/Ph0tonic/GestSIS_APP.svg?token=CpCE2t9dSFqCXfyBr7VR&branch=master)](https://travis-ci.com/Ph0tonic/GestSIS_APP)

# GestSIS_APP

Application web pour GestSIS

## Installation

Effectuer les 3 commandes ci-dessous pour lancer le serveur de production.
Il est possible de configurer l'URL de l'api et du serveur d'authentification dans le fichier `.env.local`!

### Installation des dépendances
```
npm install
```

### Configuration du fichier .env.local
```
cp .env.example .env.local
```

### Serveur de développement (compilation et hot-reload)
```
npm run serve
```

### Lancer les tests
```
npm run test
```

### Linter et résolution des problèmes liés
```
npm run lint
```

### Compilation et minification pour mise en production
```
npm run build
```

### Développement dans une machine virtuelle
Si le serveur de développement est lancé dans une machine virtuelle, mais que l'accès se fait depuis l'hôte, il est nécessaire de suivre les étapes suivantes.
- dans `.env.local`, remplacer `127.0.0.1` par l'adresse réelle de la machine virtuelle
- créer un fichier `vue.config.js` à la racine, contenant le code suivant
```js
module.exports = {
  devServer: {
    host: 'YOUR-HOST-HERE',
    hot: true,
    disableHostCheck: true,
  }
};
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Deploy

```
yarn build
scp -r dist user@example.com:folder
```

