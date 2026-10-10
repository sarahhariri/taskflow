# TaskFlow

A full-stack task management application built with React, Laravel, and Bootstrap. TaskFlow helps organize tasks, track progress, and manage customer-related work through a responsive interface.

## Features

- Create, edit, and delete tasks.
- Store task titles, customer names, dates, and descriptions.
- Track statuses: New, In Progress, and Completed.
- Filter tasks by status.
- View task counts and summary cards.
- Confirm deletion with SweetAlert2.
- Save task data through a Laravel API backed by MySQL.

## Tech Stack

- **Frontend:** React 19, Bootstrap 5, Vite, SweetAlert2
- **Backend:** Laravel 13, PHP
- **Database:** MySQL

## Project Structure

```text
taskflow/
├── taskflow-api/        # Laravel backend
├── taskflow-frontend/   # React frontend
└── README.md
```

## Requirements

- PHP 8.3 or a compatible newer version
- Composer
- Node.js and npm compatible with Vite 8
- MySQL
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/sarahhariri/taskflow.git
cd taskflow
```

### 2. Set up the backend

```bash
cd taskflow-api
composer install
```

Copy `.env.example` to `.env`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Create a MySQL database named `taskflow` using your database manager or SQL:

```sql
CREATE DATABASE taskflow;
```

Update the database credentials in `.env` to match your local MySQL installation:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taskflow
DB_USERNAME=root
DB_PASSWORD=
```

Generate the application key, create the database tables, and start the API:

```bash
php artisan key:generate
php artisan migrate
php artisan serve
```

Keep this terminal running. The backend runs at:

```text
http://127.0.0.1:8000
```

### 3. Set up the frontend

Open another terminal from the project root:

```bash
cd taskflow-frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

The frontend currently uses this API URL in `src/App.jsx`:

```js
const API_URL = "http://127.0.0.1:8000/api/tasks";
```

If you run the backend on a different host or port, update this value.

### 4. Start using TaskFlow

Create tasks through the interface, update their statuses, and use the filters to track progress.

Your local database is not included in the repository. Running the migrations creates the tables; tasks you add are stored in your own database.

## Frontend Checks

Run these commands inside `taskflow-frontend`:

```bash
npm run lint
npm run build
```

## Author

**Sarah Hariri**

[GitHub](https://github.com/sarahhariri)