# react-ecommerce-backEnd

initialize a node project npm init
installed nodemon for realtime update in server
made index.js

in packg json inside script, start: 'node index.js' this will start the app when we are in the prod server, this is the entry point
dev: 'nodemon index.js' in dev server this is the entry point

UPDATE THE NODE AND NPM:
installed nodemon
reinstalled node to latest version
installed latest npm version (npm install -g npm)
installed mongodb compass GUI

Making a server:
use express to make a listener, specify the port and log to see

Connecting to mongo with mongoose:
inside a try and catch block put the connection code from mongoose doc, a console log and in catch put the error part
also from the GUI connect to the local database
a data folder for development purpose
start mongo db -> mongod dbpath folderName

installed express
installed mongoose

Follow the MVC convention
created Model folder where there will be the structure of the data
created Controller folder where the CRUD operations of the models will be

inside Model: product js file contains the schema, structure of the collections (tables)
inside Controller: the actions to create read update and delete operations

VIRTUAL: this is calculated at the run time to get some virtual fields which we need to send in the frontend

Routes folder: to attach a particular controller to any path / endpoint
we exported it to the index js where it will be used as middleware

-> Replicate all the api in the productApi into this backend
-> Every CONTROLLER needs to be attached with a Route

Cross-origin resource sharing (CORS) is a browser mechanism which enables controlled access to resources located outside of a given domain. (pagination problem solved by exposing headers in cors func)

-> Product M & C

1. fetchAllProductsByFIlter is written as fetchAllProducts in controller, where all the query strings are provided and we run the exec function to execute it
   then we chained the path in the route folder, products file .get("/", fetchAllProduct)
   made another query for total count, replicating it in every other query then at the end shall count the total from it
   sending the header X-Total-Count
2. fetchProductById (to get the id we used req.params, it is a feature in express that will give us the parameter from the url)
3. updateProduct, findByIdAndUpdate(id, req.body, {new: true}) for patch method, new:true is to get the latest document
4. addProduct, req.body to get the data & use .save() function

-> Category M & C
inside the Controller, write the api for categories and added in the index js

1. fetchAllCategories
2. createCategories (post method) use .save() function

-> Brand M & C
inside the Controller, write the api for brands and added in the index js

1. fetchAllBrands
2. createBrands (post method) use .save() function

Using Mongo db compass GUI we imported all the product, brand & category data (generally this process will bypass the mongoose schema so we should not use it)

-> User M & C
Schema.Types.Mixed is a data type which is used to denote different data types in mongoose

1. fetchLoggedInUser, use findById and use projection to send only required data (not send password or sensitive data) for now sending all data
2. fetchLoggedInUserOrders
3. updateUser

->Auth only Controller & Routes
this will work on user model but only for Authentication

1. createUser, change the endpoint to auth in base path and /signup in router file from users
2. login, User.findOne({search property}), //TODO: temporary for now

->Cart M, C routes
model: reference to the Product schema & reference to the User schema in product & user field respectively, quantity field will be a value

1. addToCart, post request, create new cart and fill the req.body with id of selected product, using populate here (populate = product), when we add an item to the cart we want the product field to be populated along the addition
2. fetchItemsById, populated the product field by the provided id and fetch the value (get), using populate here (populate = product)
   \*\*need to change in frontend for the reference because we stored everything in a flat manner in the frontEnd
3. updateCart, patch request, working fine, need to populate the result and after that send it

->Order M, C & routes
model:

1. addOrder,
2. fetchAllOrders,
3. fetchLoggedInUserOrders,
4. updateOrders
5. fetchAllOrders

\*\*fixing some small errors:
in fetch product showing only products where deleted is not equals to true
order model change, items is object not array of mixed types

to avoid same routes endpoints we changed the user order endpoint to orders/user/userId

admin login condition added so that the admin and the user do not get the same view -> in fetchAllProduct controller

PASSPORT.js -> to isolate authentication state, referred to as a login session, from other state that may be stored in the session. (npm i passport)

express-session -> to maintain sessions (npm i express-session), install passport-local for local strategy

in index.js -> adding the passport authentication middleware, session and passport-local strategy in middleware
copying the login / check user code inside the local strategies and removing it in the auth controller, instead return json with req.user, which is an object created after passport authorization
in auth route add passport.authenticate('local'[strategy name]) before login function

session ends whenever the server refreshes

accessing the data saved in session after logging in we can use req.user created by the passport serializer

encrypting / hashing password:
require crypto and inside the signUp function make salt variable then used the standard encryption template code to salt and hash the password then make the user and save it

reading and matching the password while login:
used the same encrypting standard template for checking the password
arguments -> user.salt - use the same salt for decrypting, password will be the one from passport, added a new if statement from passport documentation for decrypting and passing user.password which is already saved in user db and hashedPassword

services folder => common.js file:
this will contain all the common functions which we shall be using

1. isAuth is a middleware function which will only allow to go to the next action if and only if the user is logged in (req.user is created by serializer of passport), so we use this in the routes to keep it protected
2. sanitizeUser -> it will return user id and role (we will user this in various parts where user is getting send after success)

\*\*after sign up by default a session is not created so we need to put a line from the documentation that will create a session right after the sign up is done -> req.login(), this also calls the serializer

with the session we get a cookie which contains a small data of our session, this is used in the react authentication and it sends the stored small data through all the req, res cycle and will help us in maintaining sessions between frontend and backend

setting up jwt, jwt -> self-contained way for securely transmitting information between parties as a JSON object.
make const of jwtStrategy (already present in the docs of passport jwt strategy) and ExtractJWT and require it
const opts from the docs copy pasted the code (explain later)
client-only auth

make jwt strategy just below the location strategy
added the jwt in the check route of our authjs
make a token -> install jsonwebtoken package, jwt.sign({payload, secret_key}) [payload -> some important user information]

adding jwt strategy in our isAuth function and calling it our routes in index file
this JWT token has all the information about the user and only server can decode it
jwt strategies are used when you want to authenticate a request with a token
now if someone tries to access any protected page without sending their credentials then they get unauthorized as return value

after changing in frontend:
controller / cart -> fetchItemsByUserId, taking the user id from req.user (got after serializer and token has the user's info)
\*\*same way, changing the frontend and the backend(user.id delete in frontend and req.user added in backend)
controller / user -> fetchLoggedInUser, taking the user id from req.user (got after serializer and token has the user's info) also changed the name of the route to /own
controller / cart -> addToCart, taking the user id from req.user (got after serializer and token has the user's info), new Cart {spread the req.body and add the user: id}

delete user pwd and salt in the user controller fetchLoggedInUser so that we donot send all the user data, only required data should be sent

\*\*ISSUE: regarding the token that we sent to the api through postman but not sending it from the frontend in every request so it is giving unauthorized
to resolve this issue we need to store the token somewhere this is where the express-cookies comes into action
install express-cookies
send cookie in response helps us to save the cookie and in the consequent requests we can send it
res.cookie('jwt', token, { expires: new Date(Date.now() + 900000), httpOnly: true }) -> jwt, then token (the one we created) and the expiry after how much time (in milliseconds)
to see if the cookie is set, check set-cookie

TO BYPASS THE CORS ISSUE IN DEV SERVER:
just put the token in the token variable of cookieExtractor function

pasting the above code in login, createUser (these two are the only gateway to enter the app)

we can see the jwt in headers (set cookie) of our dev tool of the browser but not saved, reason is cross origin
so we will build the project and put it in the server
npm run build (in the frontend part), a build folder will be created
copy paste this inside the server
we need to add cors middleware for cross origin resource sharing
app.use(express.static("build"));
now everything will be hosted on the 8080 port of local host

but still no loading of products and cart as the api failed even though the token is sent
we have sent the cookie through the bearerToken, this is wrong
we need to extract the cookie through headers and extract it in the backend

from passport docs got the cookie extractor function and paste it in the common file, exported it
then in the index file we changed the opts.jwtFromRequest = cookieExtractor to this
now we get the cookie from the extractor and save it in jwtFromRequest
all this to work we need to install the cookie-parser and require it
from cookie-parser we can get all the cookie from client side

making the api independent of any external user ids, as we are getting all the details from the token:
fetchLoggedInUserOrders, changed the id from req.params to req.user (JWT token) [made it independent]
changed the endpoint to /own/
also in frontend removed the id in the api and made it independent

\*\*ISSUE:
there was an issue which states that whenever we loggedIn from any user it always picked a random token
solution: inside index, passport strategy we need to find the user by its id User.findById and the argument inside is the jwt_payload.id
this resolves the issue

Auth controller:
checkAuth, this will just check whether the user is authenticated or not
checkAuth is added in the routes

in index and auth controller sending { id: user.id, role: user.role, token(index js file) } in place of token as response

PAYMENT with STRIPE integration:
make an account in stripe and go to react stripe docs
npm install --save stripe to install in the backend
stripe keys should be stored securely
making a payment section in the index.js page, copy the code in the docs, paste it and modify
removed unnecessary codes

GO TO FRONTEND and SET UP THE REQUIRED CODE

removed calculate total amount, we can get it from req body
added our totalAmount directly from req.body and multiplied by hundred to manipulate and get the original amount

get the payment acknowledgement, this is where the concept of WEBHOOKS come into play:
read the docs and copy the code as it is, then go to the developers dashboard and create your webhook

stripe donot allow webhooks in the dev env so we need to download the stripe CLI and then we can test it in dev

install stripe cli and do the required procedures to get access and make a webHook in our server
webHook: take the commands and run it in the terminal
allow raw data (for testing)

1. create an endpoint on your server that you can send data to when the customer has been charged by stripe
2. set up webhook endpoints on your server with stripe
3. configure webhooks using the dashboard or api keys from stripe
4. add code to listen for events sent over HTTP POST requests coming from stripe
5. handle these events
6. respond back with status code 200 OK
7. if everything goes well, stripe will keep sending those notifications forever (unless something changes)
8. make sure your app handles duplicate payments gracefully
9. test it out!

a meta has been sent to the webhook by react for the confirmation with order id

DOTENV file:
to keep all our secret keys we need to make a .env file
require it with .config()
then put all the secret keys and critical data there and in place of then use process.env.NAME_OF_THE_KEYS

creating mongo cluster in mongo Atlas:
paste the password in .env
click on connect then Connecting with MongoDB Driver
copy th db_url replace the password part and add the db name
db_url paste it in the .env
if not allowed accessing then make a new user and copy the token then by pass it
now all items will be empty so we need to add then in the new cloud database
for this mongo has given some tools but i used the the exporting and importing manually

final testing of the app after integrating the cloud db

now we need to replace the http://localhost:8080 with a simple slash, our routes will start from / (in frontend)

we need to use the path package to set the path for build because directly putting path is not the best practice
use the \_\_dirname server variable, It gives back the location of the current JavaScript file's folder
then path.resolve(\_\_dirname,'build') [path resolve joins the directory and the build path]
\_\_dirname is very useful because generally we dont know where the js folder may be in other project so this will help and pinpoint the exact location

we shall remove the by pass of token from the common file

make a vercel.json config file and add all the configuration are added
builds and paths should be declared there
builds: src and use, should put the entry point (src) as index js and use @vercel/node and another for the build src build/\*\* and use @vercel/static
routes: src should be the path and dest should be the file

make a new repo in github so that we can use that to host our app in vercel
create new repo
now push the code in that new repo

-----after deployment------------
SETTING UP THE PASSWORD RESET ISSUE:
NODE MAILER shall be used
npm install nodemailer and require it

taking the code from the docs and change the transporter host to smtp, smtp is the protocol that we are going to use
google and take the port and all detail of smtp
if port 587 then the secure is false and port 465 then secure true
add the user email and use the node 2 step verification app password(created) and save it in the env variable

now take the code from nodemailer docs and apply it in the code,
make a transporter first above the middleware codes (paste code from nodemailer)
we shall get the mail id from the body
we make a post request using the second part of the code, below the routes in index js
test the api with postman and head to frontEnd
