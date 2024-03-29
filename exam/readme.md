# Noroff EP E-commerce Project
Welcome to the Noroff EP E-commerce Project! This project aims to convert an existing e-commerce site into a fully functional backend system with API endpoints, a MySQL database, and an Admin front-end interface.

## Introduction
The goal of this project is to develop a robust backend system for an e-commerce website, providing API endpoints for managing products, categories, brands, user authentication, cart management, orders, and more. The project adheres to best practices, including database design in the 3rd normal form, JWT authentication, error handling, validation, and CRUD operations for various entities.

## Technologies Used
* Node.js
* Express.js
* MySQL
* Sequelize ORM
* JWT (JSON Web Tokens) for authentication
* Jest and Supertest for unit testing

## Installation
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run npm install to install the required dependencies.
4. Set up a MySQL database and configure the database connection in the .env file.
5. Run the database migrations and seeders to create and populate the initial data.
6. Ensure environment variables are correctly set up, including JWT secret, database credentials, and other configuration options.

## Set up the database
1. make sure you have a MySQL server installed and running on your device.
2. Create a new MySQL database for your project.
3. Create a new Schema called "StockSalesDB"
4. Create a admin user for this and give it all privileges like this with this queries:
"create database StockSalesDB;" 
"CREATE USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';"
"ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';"
"GRANT ALL PRIVILEGES ON StockScategoriescategoriesalesDB.* TO 'admin'@'localhost';"
5. Update your .env file with your MySQL database details, in this specific project I used the values:
HOST="your host"
USER_ADMIN_PASSWORD="randomPassword"
ADMIN_USERNAME="yourAdminUsername"
ADMIN_PASSWORD="YourAdminPassword"
ADMIN_EMAIL="YourAdminEmail"
DATABASE_NAME="YourDataBaseName"
DIALECT="Mysql"
DIALECTMODEL="Mysql2"
PORT="yourPort"
TOKEN_SECRET="RandomlyGeneratedString"
ITEM_API="http://143.42.108.232:8888/items/stock"

After you have done this you can run the server.

## Usage
1. Start the server by running npm start.
2. Access the API endpoints using tools like Postman or via the Admin front-end interface.
3. Register a new user or log in with existing credentials to access protected routes.
4. Explore the available endpoints for managing products, categories, brands, carts, orders, and more.

## Run Tests

1. first you need to start the server (npm start), then open up another terminal within editor.
2. in the new terminal run the command: "npm test" while the server is running. 

## API Documentation
The API endpoints are documented using Swagger. Access the API documentation at /doc from the API URL (e.g., http://localhost:3000/doc). The documentation provides detailed information about each endpoint, including methods, descriptions, and JSON objects.

## Admin Front-end
The Admin front-end interface allows administrators to manage products, categories, brands, users, and orders. Access the Admin interface at /admin/ from the application URL (e.g., http://localhost:3000/admin/). Only users with admin roles can log in and access the Admin interface.

## Unit Testing
Unit tests are implemented using Jest and Supertest. The tests cover CRUD operations for categories, products, and user authentication endpoints. Run the tests using npm test.

## Documentation
ERD (Entity-Relationship Diagram): The complete database schema is visualized in the ERD, showcasing all tables, relationships, and properties.
Project Reflection: A reflection report discusses the progression of the project, challenges faced, and lessons learned.
API Documentation: Detailed documentation of API endpoints, methods, descriptions, and JSON objects.
Jira Roadmap: Screenshot of the Jira Roadmap showing Epics and Sprints.