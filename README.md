# food-db
* CRUD user food-trails
* Stores user created food locations based on lat and lng


## Link to page
[Food DB](https://kod2nd-food-db.netlify.com/)

## Getting set up:

1. Fork and Clone Repo
2. ```npm install```
3. Start server: ```npm run dev```
4. jest tests: ```npm test``` or ```npm run test:watch```
5. if running local mongo DB: ```mongod --dbpath /yourMongoDBPath```

## Usage

This JWT Token authorisation based server/database is designed to create, read, update and delete user food locations.

#### .env file
* To use jwt passport authentication, .env file containing the passport secret is required. 

#### Models
* user.js
* locations.js

#### routes
* refer to [api help](https://kod2nd-food-db.netlify.com/api-help) for information on routes



