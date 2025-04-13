# This file contains the model for Resume
from app import db
from datetime import datetime

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    employer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    job_type = db.Column(db.String(50))  # Full-time, Part-time, Contract, etc.
    salary = db.Column(db.String(50))
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    application_count = db.Column(db.Integer, default=0)  # Number of applications received
 

# Define your JobApplication model - add this to app/models/job_application.py or create the file
class JobApplication(db.Model):
    __tablename__ = 'job_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, invited, rejected
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cover_letter = db.Column(db.Text)
    resume_file = db.Column(db.String(255)) 
    
    # Define relationship to Job for easier querying
    job = db.relationship('Job', backref='applications')