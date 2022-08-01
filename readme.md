
# MassNow News Site (Backend) - Node.js / MongoDb
> Multiuser news blogging platform built with the MERN Stack as well as Next.js

This is the backend sever side a newly completed MERN stack project, a fictional multi user news site similar to Masslive.com. Some of the features of this project include but not limited to JWT based Authentication System, Role Based Authorization System, Role Based Authorization System, full CRUD capabilities with image uploading capabilities. 

## Features

- JWT based Authentication System
- Role-Based Authorization System
- Full CRUD, and image uploading capabilities for multiple users
- CRUD capabilities can also be role-based, for instance, Admins would have the ability to have full CRUD capabilities with regards to any blogs, but authors would only have this ability regarding only the blogs they have created.
- Commenting system for each article, with replies for each comment. Users would need to be registered
- Ability to bookmark an article
- Live search for and article


### Summer 2022 Updated features

There has been several updates added, which includes but is not limited to, the ability to choose which articles that an administrator would want to feature in a news section using a frontend ui interface. For instance on the home page you have a hero section that features a main cover story as well as four other highlighted stories in that section. Now those who has a role of admin will have to ability to determine which stories will be highlighted in that section.

![Top News Section](/screenshots/edit-topnews-section.jpg)

![Selected Story](/screenshots/slected-story.jpg)

Also admins, and authors have the ability in the admin section to use a filtering system if needed to filter/sort through articles if for instance they would need to edit or delete an article.

![Selected Story](/screenshots/filters.jfif)

<br>


## Getting Started

To get started clone or download the repository, this is the backend repository so you will want to make sure you have ran npm install to install the necessary dependencies and make sure you have this server side running before starting the front end repository. Then rename the .env-sample file to just .env. 

This project uses MongoDB for its database needs, so you can use a localized version, or signup for a free at **[Mongo Atlas](https://www.mongodb.com/ "MongoDB")** account and store your database in the cloud. once you have a database setup in the .env file look for the key **DATABASE_CLOUD**, replace 'Your MongoDB uri' with your MongoDb uri.

To test out some of the features above without having to create your own data from scratch you can use the included sample data to start with. There two ways you can do this.

#### First way :
* create a MongoDB database either in the cloud or on your computer
* If you have MongoDB installed on your computer navigate to the **Tools\100\bin** folder inside your MongoDB folder in a CMD prompt. You may need to have admin privileges.
* When you are pointing to this directory paste this command 
`.\mongorestore --uri="mongodb+srv://<username>:<pass><"your newly created database uri">" --dir="<"absolute path on your cpu">\backend\sample_data\mongo_sample_data"`
<br><br>
What you're doing is getting the included sample data from <"absolute path on your cpu">\backend\sample_data\mongo_sample_data that is included in this repository and copying all the data to your brand new database.

### Second way :

Seed your database using the included seeder.js file in the utils folder. This file uses sample data contained in the data folder, to seed data. To perform this step. Run:

```
npm run data:import
```

To clear all the data in your database run: 

```
npm run data:destroy
```
Sample Admin Login
```
admin@yahoo.com (Admin)
123456
```

Feel free to change any data in the data folder to suit your needs.



## BUILT WITH
* Node.js
* React.js
* Next.js
* Express
* MongoDB
