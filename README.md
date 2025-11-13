# ⚙️ Utility Management System (UMS)

A full-stack web application designed to manage and track various utility bills — including electricity, gas, water, and internet.  
The system provides a secure platform for users to view, pay, and download their billing information with real-time updates and authentication.

## 🔗 Necessary Links 
|Live Site Link  |Sever Repository Link | Client Repository Link |
|--------------|-------------|-------------|
| https://utility-management-system.netlify.app/ | https://github.com/am-mahmud/ums-server |  https://github.com/am-mahmud/ums-client

## 🧩 Project Overview

**UMS** is divided into two main parts:

| Layer | Description |
|--------|-------------|
| **Client (Frontend)** | Built with **React**, it handles the user interface, authentication, and interactions such as viewing bills, managing personal payments, and generating reports. |
| **Server (Backend)** | Powered by **Node.js**, **Express**, and **MongoDB**, it manages user data, bills, authentication tokens, and provides secure APIs for frontend communication. |

Together, these two layers communicate securely through REST APIs, protected with JWT and Firebase token verification.

## 🧩 How the System Works
####🔹 Client Side
- User Authentication
- Users sign in via Firebase Authentication (Google or email login)- Upon login, Firebase generates a user token.
- Token Exchange
- The frontend sends the Firebase token to the backend.
- The backend verifies it and issues a JWT token for secure communication.
- Bill Management Interface
- Displays categories and recent bills retrieved from the API.
- Users can add, edit, or delete their own bills.
- Access control ensures users can only modify their own data.
- PDF Export & UI Enhancements
- Uses jsPDF and jspdf-autotable to export bills as PDF reports.
- Built with TailwindCSS, DaisyUI, and Framer Motion for a responsive and interactive UI.

####🔹 Server Side

- Express REST API
- Manages communication between the client and database.
- Provides routes for users, bills, and authentication.
- Firebase Admin SDK
- Verifies Firebase tokens from the frontend.
- Ensures that all requests come from legitimate authenticated users.
- JWT Authorization
- After verification, the backend issues a JWT token.
- This token must accompany future requests to access protected endpoints.
- MongoDB Database
- Stores user profiles and billing records.
- Supports full CRUD operations via the Express API.
- Data is indexed by user email for efficient lookups.

## 🧰 Technologies Used
| Category	| Technologies |
|--------|-------------|
| Frontend	| React, React Router, TailwindCSS, DaisyUI, Firebase, Framer Motion, jsPDF
| Backend |	Node.js, Express.js, MongoDB, Firebase Admin SDK, JSON Web Token (JWT)
| Utilities & Tools |	dotenv, Nodemon, CORS
| Development Environment |	Vite (Frontend), Nodemon (Backend)

## 🔐 Security Layers
|Layer	| Mechanism	 |Description |
|--------|-------------|-------------|
| Frontend  Auth |	Firebase Authentication	| Handles user sign-in and identity verification.|
|Backend Auth	|Firebase Admin SDK	| Validates Firebase ID token before issuing JWT.|
|API Security |	JWT (Bearer Token)	|Protects sensitive routes and ensures authorized access.
|Data Privacy |	MongoDB Schema Filtering	|Ensures users only see their own bills and information.|


## 🔄 Data Flow Summary

- The client authenticates the user via Firebase.
- The server verifies the Firebase token and generates a JWT.
- The client sends requests using that JWT for authentication.
- The server interacts with MongoDB to access or update data.
- The client displays bills, supports PDF export, and management actions.

## 📚 Core Features Summary
|Feature	|Description|
|--------|-------------|
|User Authentication	|Firebase login with JWT protection for backend routes.|
|Bill Management	|Add, view, edit, or delete bills securely.|
|PDF Report |	Export all bills as a downloadable PDF.|
|Categorized View	|Organize bills by type (Electricity, Gas, etc.).|
|Recent Bills |	Dashboard showing the last 6 added bills.|
|Protected Routes|	Only accessible with a valid JWT token.|

## 👤 Author
#### Asif Mahmud