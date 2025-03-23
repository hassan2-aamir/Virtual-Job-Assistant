from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.SmallInteger, nullable=False)  # 1: Employee, 2: Employer
    name = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)
    profile_picture = db.Column(db.String(255))
    signup_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    last_login = db.Column(db.DateTime)

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    location = db.Column(db.String(255))
    salary_range = db.Column(db.String(100))
    job_type = db.Column(db.String(50))
    status = db.Column(db.String(20), default='Open')
    date_posted = db.Column(db.DateTime, default=db.func.current_timestamp())

class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    skills = db.Column(db.Text)
    experiences = db.Column(db.Text)
    certifications = db.Column(db.Text)
    portfolio = db.Column(db.JSON)
    education = db.Column(db.Text)
    pdf_resume = db.Column(db.String(255))
    last_updated = db.Column(db.DateTime, default=db.func.current_timestamp())

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    application_status = db.Column(db.String(50), default='Pending')
    applied_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    resume_link = db.Column(db.String(255))
