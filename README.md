# Conference management for seminars
## Usage
- clone this repository
- create `.env` file for the docker-compose script, which contains all variables needed
  ```
  MYSQL_ROOT_PASSWORD=""
  MYSQL_DATABASE=""
  
  VITE_BACKEND_URL="https://jupiter.fh-swf.de/conference/api"
  
  FRONTEND_URL="https://jupiter.fh-swf.de/conference"
  COOKIE_SECRET=""
  
  #optional: pre defined LTI Credentials
  CONSUMER_KEY=""
  CONSUMER_SECRET=""
  
  #OIDC Config
  CLIENT_ID=""
  CLIENT_SECRET=""
  ISSUER="https://www.ki.fh-swf.de/keycloak/realms/cluster"
  CALLBACK_URL="https://jupiter.fh-swf.de/conference/api/login/callback"

  #Mail Config (SMTP port 465 default)
  MAIL_USERNAME=""
  MAIL_PASSWORD=""
  SMTP_HOST=""
  SENDER_MAIL=""

  ```
- run `docker-compose --env-file ../.env up -d --build` in the project root folder

## Creation and configuration of the OIDC client with Keycloak
- login to the keycloak admin console
- select the realm you want to use
- create a new client
  - General settings
      -  insert a client id
  - Capability config
    - change 'Client authentication' to 'On'
    - Authorization should be 'Off'
    - 'Standard Flow' and 'Direct access grants' should be 'On', the rest 'Off'
  - Login Settings
    - Root URL: ' '
    - Home URL: 'https://jupiter.fh-swf.de/conference/'
    - Valid redirect URIs: 'https://jupiter.fh-swf.de/conference/api/login/callback'
    - Valid post logout URIs: 'https:/jupiter.fh-swf.de/conference/*'
    - Web Origins: ' '
  - click on 'save'
  - click on 'Credentials'
  - copy the 'Client Secret' and insert it into the .env file, with inserted client id

## Mail SMTP configuration
This project uses nodemailer to send mails. To use this feature you need to configure the SMTP server in the .env file.
For connection to the SMTP server port 465 is used by default.
- MAIL_USERNAME: username for the SMTP server
- MAIL_PASSWORD: password for the SMTP server
- SMTP_HOST: host of the SMTP server
- SENDER_MAIL: mail address of the sender

## LTI pre defined credentials
When starting for the first time, it is possible to use existing LTI credentials.
This allows the application to be linked directly in Moodle without having to create LTI credentials via the 'LtiCredentials' table.


## .env files for development
To run this project you need to create two .env files.
First one is in the root folder and it should contain the following:
  ```
  VITE_BACKEND_URL="https://jpiter.fh-swf.de/conference/api"
  ```
Second one is in the server folder:
  ```
  FRONTEND_URL="https://jpiter.fh-swf.de/conference"
  COOKIE_SECRET=""
  
  DB_TYPE="mariadb"
  DB_HOST=""
  DB_NAME=""
  DB_USER=""
  DB_PASSWORD=""
  DB_PORT=3306
  
  #optional: pre defined LTI Credentials
  CONSUMER_KEY=""
  CONSUMER_SECRET=""
  
  CLIENT_ID=""
  CLIENT_SECRET=""
  ISSUER=""
  CALLBACK_URL=""

  MAIL_USERNAME=""
  MAIL_PASSWORD=""
  SMTP_HOST=""
  SENDER_MAIL=""

  ```

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md)
  uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast
  Refresh

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
