# 🎓 Student Life Manager

A lightweight, full-stack web application built with **Python Flask** and **SQLite** that helps college students manage their academic and personal activities — all from a single, clean dashboard.

No login required. No external APIs. No heavy frameworks. Just install, run, and go.

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Features](#-features)
- [Folder Structure](#-folder-structure)
- [Technologies Used](#-technologies-used)
- [Installation](#-installation)
- [How to Run](#-how-to-run)
- [Module Walkthrough](#-module-walkthrough)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 📖 Project Description

**Student Life Manager** is a college mini project designed to solve a real problem — students juggling expenses, assignments, attendance, and study schedules across multiple apps, notebooks, and reminder apps.

This application consolidates everything into one responsive web interface:

- Track daily expenses and stay within a monthly budget
- Never miss an assignment deadline
- Monitor subject-wise attendance and get alerted below 75%
- Plan study sessions with a daily and upcoming task view

The database is created automatically on first run. No configuration needed.

---

## ✨ Features

### 💰 Expense Tracker
- Add daily expenses with amount, category, description, and date
- Five categories: Food, Travel, Books, Entertainment, Other
- Monthly budget tracking with a visual progress bar
- Remaining budget display (turns red when over budget)
- Category-wise breakdown with individual mini progress bars
- Full expense history with live search filter
- Delete individual records

### 📝 Assignment Tracker
- Add assignments with subject, title, and due date
- Automatic overdue detection with red highlight
- Mark assignments as Completed
- Completion progress bar across all assignments
- Overdue and Due Soon panel for at-a-glance urgency
- Status filter (All / Pending / Completed) with live search
- Pending count visible on the dashboard

### 📊 Attendance Tracker
- Record daily attendance per subject (Present / Absent)
- Subject autocomplete from existing subjects
- Subject-wise attendance percentage with Good / Warning / Critical labels
- Smart calculator: shows how many consecutive classes needed to reach 75%
- Overall attendance progress bar with a visible 75% threshold marker
- Red alert banner when overall attendance drops below 75%
- Full attendance history with search and status filter
- Overall attendance percentage shown on dashboard

### 📅 Study Planner
- Add study tasks with description, optional subject, and target date
- Today's Planner panel — checklist view of tasks due today
- Upcoming Tasks grid — card layout for all future pending tasks
- Overdue task detection with red date highlight
- Mark tasks Completed or delete them
- Completion progress bar across all tasks
- Full task table with live search and status filter

### 🏠 Dashboard
- Four summary cards with live stats pulled from all modules
- Attendance badge (Good / Warning / Critical) on the dashboard card
- Global low-attendance alert if overall attendance is below 75%
- Live date display
- Quick Tips section
- Fully responsive — works on mobile, tablet, and desktop

---

## 📁 Folder Structure

```
StudentLifeManager/
│
├── app.py                  # Flask application — all routes and DB logic
├── requirements.txt        # Python dependencies (Flask only)
├── README.md               # Project documentation
├── database.db             # SQLite database (auto-created on first run)
│
├── static/
│   ├── style.css           # Complete stylesheet — blue & white theme
│   └── script.js           # Global JavaScript — nav, animations, validation
│
└── templates/
    ├── dashboard.html      # Home page — four module summary cards
    ├── expense.html        # Expense Tracker page
    ├── assignment.html     # Assignment Tracker page
    ├── attendance.html     # Attendance Tracker page
    └── planner.html        # Study Planner page
```

---

## 🛠 Technologies Used

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Python 3.x, Flask 3.0.3             |
| Database    | SQLite 3 (via Python standard lib)  |
| Frontend    | HTML5, CSS3, Vanilla JavaScript     |
| Fonts       | Google Fonts — Space Grotesk, Inter |
| Icons       | Font Awesome 6.5                    |
| Templating  | Jinja2 (bundled with Flask)         |

No MySQL. No React. No Node.js. No external APIs. No authentication system.

---

## ⚙️ Installation

### Prerequisites

- Python 3.8 or higher installed
- `pip` package manager available

### Steps

**1. Clone or download the project**

```bash
git clone https://github.com/yourusername/StudentLifeManager.git
cd StudentLifeManager
```

Or simply download and extract the ZIP, then open a terminal inside the `StudentLifeManager/` folder.

**2. (Recommended) Create a virtual environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

That installs Flask 3.0.3. Everything else (SQLite, Jinja2, Werkzeug) is either bundled or part of Python's standard library.

---

## ▶️ How to Run

```bash
python app.py
```

Then open your browser and go to:

```
http://127.0.0.1:5000
```

The SQLite database (`database.db`) and all four tables are created automatically on the first run. No manual database setup is required.

To stop the server press `Ctrl + C` in the terminal.

---

## 🗂 Module Walkthrough

### Dashboard — `http://127.0.0.1:5000/`
The home page. Shows a summary card for each module with live stats. Displays a global alert if attendance is below 75%.

### Expense Tracker — `http://127.0.0.1:5000/expense`
Add an expense using the form on the left. The category breakdown and budget bar update automatically. Search or delete records from the history table at the bottom.

### Assignment Tracker — `http://127.0.0.1:5000/assignment`
Add an assignment with a due date. Overdue assignments are highlighted in red. Click the green tick to mark complete. Use the dropdown to filter by status.

### Attendance Tracker — `http://127.0.0.1:5000/attendance`
Select a subject (or type a new one), pick a date, and mark Present or Absent. The subject-wise panel updates instantly. If a subject is below 75%, the app tells you exactly how many classes to attend to recover.

### Study Planner — `http://127.0.0.1:5000/planner`
Add study tasks with a target date. Today's tasks appear in the checklist panel. Upcoming tasks appear as cards. The full table at the bottom shows all tasks with filter and search.

---

## 🗄 Database Schema

The database is stored in `database.db` and contains four tables:

```sql
-- Expense Tracker
CREATE TABLE expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    amount      REAL    NOT NULL,
    category    TEXT    NOT NULL,
    description TEXT,
    date        TEXT    NOT NULL
);

-- Assignment Tracker
CREATE TABLE assignments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    subject     TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    due_date    TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'Pending'
);

-- Attendance Tracker
CREATE TABLE attendance (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    subject     TEXT    NOT NULL,
    date        TEXT    NOT NULL,
    status      TEXT    NOT NULL
);

-- Study Planner
CREATE TABLE planner (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    task        TEXT    NOT NULL,
    subject     TEXT,
    target_date TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'Pending'
);
```

---

## 🚀 Future Enhancements

The following features can be added in future versions:

### Authentication
- Student login and registration system
- Per-student data isolation using session management

### Expense Tracker
- Customisable monthly budget (currently hardcoded to ₹5000)
- Export expense history to CSV or PDF
- Month-selector to view past months
- Pie chart visualisation using Chart.js

### Assignment Tracker
- Email or browser notification reminders before due dates
- Priority levels (High / Medium / Low)
- File attachment support for assignment briefs

### Attendance Tracker
- Timetable integration — auto-suggest subjects by day and period
- Minimum attendance goal customisation per subject
- Attendance report export to PDF

### Study Planner
- Drag-and-drop task reordering
- Pomodoro timer built into the planner
- Recurring tasks (daily / weekly)
- Notes field per task

### General
- Dark mode toggle
- Data backup and restore (export/import JSON)
- PWA (Progressive Web App) support for offline use and home screen install
- Admin panel to reset or manage all data

---

## 👨‍💻 Author

Built as a college mini project using Python, Flask, SQLite, HTML, CSS, and JavaScript.

---

## 📄 License

This project is open source and free to use for educational purposes.