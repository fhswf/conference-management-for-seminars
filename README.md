# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md)
  uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast
  Refresh

## .env files

To run this project you need to create two .env files.
First one is in the root folder and it should contain the following:
  ```
  VITE_BACKEND_URL=""
  ```
Second one is in the server folder:
  ```
  EXPRESS_IP=""
  FRONTEND_URL=""
  EXPRESS_PORT_HTTP=3000
  
  DB_TYPE="mariadb"
  DB_HOST="dbserver"
  DB_NAME=""
  DB_USER=""
  DB_PASSWORD=""
  DB_PORT=3306
  
  CONSUMER_KEY=""
  CONSUMER_SECRET=""
  ```

If you build this project with docker you should pass following .env which contains all variables needed in the docker-compose script:
  ```
  #Docker Compose
  MYSQL_ROOT_PASSWORD=""
  MYSQL_DATABASE="konferenz-management"
  
  #Frontend
  VITE_BACKEND_URL="jupiter.fh-swf.de/conference/api"
  
  #Backend
  FRONTEND_URL="jupiter.fh-swf.de/conference/"
  FRONTEND_PORT=11001
  EXPRESS_PORT_HTTP=11000
  
  DB_TYPE="mariadb"
  DB_HOST="dbserver"
  DB_NAME=""
  DB_USER=""
  DB_PASSWORD=""
  DB_PORT=3306
  
  CONSUMER_KEY=""
  CONSUMER_SECRET=""
  ```


## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
        sourceType
:
    'module',
        project
:
    ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir
:
    __dirname,
}
,
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked`
  or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and
  add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list