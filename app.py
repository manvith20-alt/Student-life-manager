# StudentLifeManager/app.py

from flask import Flask, render_template, request, redirect, url_for
import sqlite3
import os
from datetime import datetime, date

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')


# ──────────────────────────────────────────────
# DATABASE SETUP
# ──────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.executescript('''
        CREATE TABLE IF NOT EXISTS expenses (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            amount      REAL    NOT NULL,
            category    TEXT    NOT NULL,
            description TEXT,
            date        TEXT    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cgpa (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            semester    INTEGER NOT NULL,
            subject     TEXT    NOT NULL,
            credits     REAL    NOT NULL,
            grade       TEXT    NOT NULL,
            grade_point REAL    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS assignments (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            subject     TEXT    NOT NULL,
            title       TEXT    NOT NULL,
            due_date    TEXT    NOT NULL,
            status      TEXT    NOT NULL DEFAULT 'Pending'
        );

        CREATE TABLE IF NOT EXISTS attendance (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            subject     TEXT    NOT NULL,
            date        TEXT    NOT NULL,
            status      TEXT    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS planner (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            task        TEXT    NOT NULL,
            subject     TEXT,
            target_date TEXT    NOT NULL,
            status      TEXT    NOT NULL DEFAULT 'Pending'
        );
    ''')

    conn.commit()
    conn.close()


# ──────────────────────────────────────────────
# DASHBOARD
# ──────────────────────────────────────────────

@app.route('/')
def dashboard():
    conn = get_db()

    month = datetime.now().strftime('%Y-%m')
    total_expense = conn.execute(
        "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date LIKE ?",
        (f'{month}%',)
    ).fetchone()['total']

    pending_assignments = conn.execute(
        "SELECT COUNT(*) as cnt FROM assignments WHERE status='Pending'"
    ).fetchone()['cnt']

    att_rows = conn.execute("SELECT status FROM attendance").fetchall()
    total_classes = len(att_rows)
    attended = sum(1 for r in att_rows if r['status'] == 'Present')
    overall_att = round((attended / total_classes * 100), 1) if total_classes else 0

    pending_tasks = conn.execute(
        "SELECT COUNT(*) as cnt FROM planner WHERE status='Pending'"
    ).fetchone()['cnt']

    cgpa_rows = conn.execute("SELECT credits, grade_point FROM cgpa").fetchall()
    total_cr = sum(r['credits'] for r in cgpa_rows)
    w_pts    = sum(r['credits'] * r['grade_point'] for r in cgpa_rows)
    overall_cgpa = round(w_pts / total_cr, 2) if total_cr else 0.0

    conn.close()
    return render_template('dashboard.html',
                           total_expense=total_expense,
                           pending_assignments=pending_assignments,
                           overall_att=overall_att,
                           pending_tasks=pending_tasks,
                           overall_cgpa=overall_cgpa)


# ──────────────────────────────────────────────
# EXPENSE TRACKER
# ──────────────────────────────────────────────

MONTHLY_BUDGET = 2500

@app.route('/expense', methods=['GET', 'POST'])
def expense():
    conn = get_db()
    if request.method == 'POST':
        amount      = float(request.form['amount'])
        category    = request.form['category']
        description = request.form.get('description', '')
        exp_date    = request.form['date'] or date.today().isoformat()
        conn.execute(
            "INSERT INTO expenses (amount, category, description, date) VALUES (?,?,?,?)",
            (amount, category, description, exp_date)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('expense'))

    month = datetime.now().strftime('%Y-%m')
    expenses = conn.execute(
        "SELECT * FROM expenses ORDER BY date DESC"
    ).fetchall()
    monthly_expenses = conn.execute(
        "SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC",
        (f'{month}%',)
    ).fetchall()
    monthly_total = sum(r['amount'] for r in monthly_expenses)
    remaining = MONTHLY_BUDGET - monthly_total

    cat_summary = conn.execute(
        "SELECT category, COALESCE(SUM(amount),0) as total FROM expenses "
        "WHERE date LIKE ? GROUP BY category",
        (f'{month}%',)
    ).fetchall()

    conn.close()
    return render_template('expense.html',
                           expenses=expenses,
                           monthly_total=monthly_total,
                           remaining=remaining,
                           budget=MONTHLY_BUDGET,
                           cat_summary=cat_summary,
                           month=month)


@app.route('/expense/delete/<int:eid>')
def delete_expense(eid):
    conn = get_db()
    conn.execute("DELETE FROM expenses WHERE id=?", (eid,))
    conn.commit()
    conn.close()
    return redirect(url_for('expense'))


# ──────────────────────────────────────────────
# ASSIGNMENT TRACKER
# ──────────────────────────────────────────────

@app.route('/assignment', methods=['GET', 'POST'])
def assignment():
    conn = get_db()
    if request.method == 'POST':
        subject  = request.form['subject']
        title    = request.form['title']
        due_date = request.form['due_date']
        conn.execute(
            "INSERT INTO assignments (subject, title, due_date, status) VALUES (?,?,?,'Pending')",
            (subject, title, due_date)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('assignment'))

    assignments = conn.execute(
        "SELECT * FROM assignments ORDER BY due_date ASC"
    ).fetchall()
    conn.close()
    today = date.today().isoformat()
    return render_template('assignment.html', assignments=assignments, today=today)


@app.route('/assignment/complete/<int:aid>')
def complete_assignment(aid):
    conn = get_db()
    conn.execute("UPDATE assignments SET status='Completed' WHERE id=?", (aid,))
    conn.commit()
    conn.close()
    return redirect(url_for('assignment'))


@app.route('/assignment/delete/<int:aid>')
def delete_assignment(aid):
    conn = get_db()
    conn.execute("DELETE FROM assignments WHERE id=?", (aid,))
    conn.commit()
    conn.close()
    return redirect(url_for('assignment'))


# ──────────────────────────────────────────────
# ATTENDANCE TRACKER
# ──────────────────────────────────────────────

def attendance_label(pct):
    if pct >= 85:
        return 'Good'
    elif pct >= 75:
        return 'Warning'
    else:
        return 'Critical'


@app.route('/attendance', methods=['GET', 'POST'])
def attendance():
    conn = get_db()
    if request.method == 'POST':
        subject  = request.form['subject']
        att_date = request.form['date'] or date.today().isoformat()
        status   = request.form['status']
        conn.execute(
            "INSERT INTO attendance (subject, date, status) VALUES (?,?,?)",
            (subject, att_date, status)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('attendance'))

    subjects = conn.execute(
        "SELECT DISTINCT subject FROM attendance ORDER BY subject"
    ).fetchall()

    subject_stats = []
    for s in subjects:
        subj = s['subject']
        rows = conn.execute(
            "SELECT status FROM attendance WHERE subject=?", (subj,)
        ).fetchall()
        total   = len(rows)
        present = sum(1 for r in rows if r['status'] == 'Present')
        pct     = round(present / total * 100, 1) if total else 0
        subject_stats.append({
            'subject': subj,
            'total':   total,
            'present': present,
            'pct':     pct,
            'label':   attendance_label(pct)
        })

    all_rows    = conn.execute("SELECT status FROM attendance").fetchall()
    total_all   = len(all_rows)
    present_all = sum(1 for r in all_rows if r['status'] == 'Present')
    overall_pct = round(present_all / total_all * 100, 1) if total_all else 0

    history = conn.execute(
        "SELECT * FROM attendance ORDER BY date DESC LIMIT 50"
    ).fetchall()

    conn.close()
    return render_template('attendance.html',
                           subject_stats=subject_stats,
                           overall_pct=overall_pct,
                           overall_label=attendance_label(overall_pct),
                           total_all=total_all,
                           present_all=present_all,
                           history=history)


@app.route('/attendance/delete/<int:rid>')
def delete_attendance(rid):
    conn = get_db()
    conn.execute("DELETE FROM attendance WHERE id=?", (rid,))
    conn.commit()
    conn.close()
    return redirect(url_for('attendance'))


# ──────────────────────────────────────────────
# STUDY PLANNER
# ──────────────────────────────────────────────

@app.route('/planner', methods=['GET', 'POST'])
def planner():
    conn = get_db()
    if request.method == 'POST':
        task        = request.form['task']
        subject     = request.form.get('subject', '')
        target_date = request.form['target_date']
        conn.execute(
            "INSERT INTO planner (task, subject, target_date, status) VALUES (?,?,?,'Pending')",
            (task, subject, target_date)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('planner'))

    today = date.today().isoformat()
    upcoming = conn.execute(
        "SELECT * FROM planner WHERE status='Pending' AND target_date >= ? "
        "ORDER BY target_date ASC",
        (today,)
    ).fetchall()
    today_tasks = conn.execute(
        "SELECT * FROM planner WHERE target_date=? ORDER BY id ASC",
        (today,)
    ).fetchall()
    all_tasks = conn.execute(
        "SELECT * FROM planner ORDER BY target_date ASC"
    ).fetchall()

    conn.close()
    return render_template('planner.html',
                           upcoming=upcoming,
                           today_tasks=today_tasks,
                           all_tasks=all_tasks,
                           today=today)


@app.route('/planner/complete/<int:pid>')
def complete_task(pid):
    conn = get_db()
    conn.execute("UPDATE planner SET status='Completed' WHERE id=?", (pid,))
    conn.commit()
    conn.close()
    return redirect(url_for('planner'))


@app.route('/planner/delete/<int:pid>')
def delete_task(pid):
    conn = get_db()
    conn.execute("DELETE FROM planner WHERE id=?", (pid,))
    conn.commit()
    conn.close()
    return redirect(url_for('planner'))


# ──────────────────────────────────────────────
# CGPA CALCULATOR
# ──────────────────────────────────────────────

GRADE_POINTS = {
    'O'  : 10.0,
    'A+' : 9.0,
    'A'  : 8.0,
    'B+' : 7.0,
    'B'  : 6.0,
    'C'  : 5.0,
    'P'  : 4.0,
    'F'  : 0.0
}


def calc_sgpa(subjects):
    total_credits   = sum(s['credits'] for s in subjects)
    weighted_points = sum(s['credits'] * s['grade_point'] for s in subjects)
    sgpa = round(weighted_points / total_credits, 2) if total_credits else 0.0
    return sgpa, total_credits


def performance_label(gpa):
    if gpa >= 9.0:
        return 'Outstanding'
    elif gpa >= 8.0:
        return 'Excellent'
    elif gpa >= 7.0:
        return 'Good'
    elif gpa >= 6.0:
        return 'Average'
    elif gpa >= 5.0:
        return 'Satisfactory'
    elif gpa > 0:
        return 'Poor'
    else:
        return 'N/A'


@app.route('/cgpa', methods=['GET', 'POST'])
def cgpa():
    conn = get_db()

    if request.method == 'POST':
        action = request.form.get('action')

        if action == 'add_subject':
            semester    = int(request.form['semester'])
            subject     = request.form['subject'].strip()
            credits     = float(request.form['credits'])
            grade       = request.form['grade']
            grade_point = GRADE_POINTS.get(grade, 0.0)
            conn.execute(
                "INSERT INTO cgpa (semester, subject, credits, grade, grade_point) "
                "VALUES (?,?,?,?,?)",
                (semester, subject, credits, grade, grade_point)
            )
            conn.commit()

        elif action == 'delete_subject':
            sid = int(request.form['subject_id'])
            conn.execute("DELETE FROM cgpa WHERE id=?", (sid,))
            conn.commit()

        elif action == 'delete_semester':
            sem = int(request.form['semester_num'])
            conn.execute("DELETE FROM cgpa WHERE semester=?", (sem,))
            conn.commit()

        conn.close()
        return redirect(url_for('cgpa'))

    all_rows = conn.execute(
        "SELECT * FROM cgpa ORDER BY semester ASC, id ASC"
    ).fetchall()

    semesters_raw = {}
    for row in all_rows:
        sem = row['semester']
        if sem not in semesters_raw:
            semesters_raw[sem] = []
        semesters_raw[sem].append(row)

    semesters = []
    total_subject_count = 0
    for sem_num, subjects in sorted(semesters_raw.items()):
        sgpa, total_credits = calc_sgpa(subjects)
        total_subject_count += len(subjects)
        semesters.append({
            'number'        : sem_num,
            'subjects'      : subjects,
            'sgpa'          : sgpa,
            'total_credits' : total_credits,
            'label'         : performance_label(sgpa)
        })

    if all_rows:
        overall_credits = sum(r['credits'] for r in all_rows)
        overall_points  = sum(r['credits'] * r['grade_point'] for r in all_rows)
        cgpa_val        = round(overall_points / overall_credits, 2) if overall_credits else 0.0
    else:
        overall_credits = 0
        cgpa_val        = 0.0

    next_sem = (max(semesters_raw.keys()) if semesters_raw else 0) + 1

    conn.close()
    return render_template(
        'cgpa.html',
        semesters           = semesters,
        cgpa_val            = cgpa_val,
        overall_credits     = overall_credits,
        overall_label       = performance_label(cgpa_val),
        grade_points        = GRADE_POINTS,
        next_sem            = next_sem,
        total_subject_count = total_subject_count
    )


# ──────────────────────────────────────────────
# ENTRY POINT
# ──────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    app.run(debug=True)