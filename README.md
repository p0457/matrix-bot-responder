# matrix-bot-responder

A matrix bot that responds to specific matching text. Matches are simple and non-complex.

# Usage

1. Invite bot to a private room
2. Send a message defined in the list
3. Get a response

# Building your own

*Note*: You'll need to have access to an account that the bot can use to get the access token.

1. Clone this repository
2. `npm install`
3. `npm run build`
4. Copy `config/default.yaml` to `config/production.yaml`
5. Run the bot with `NODE_ENV=production node lib/index.js`

### Docker

```
A Dockerfile and docker-compose are provided.

Build the docker image:
`docker build -t matrix-bot-responder .`

Build the docker image and run docker-compose to deploy to your server:
`docker build -t matrix-bot-responder . && docker-compose run matrix-bot-responder`
```
