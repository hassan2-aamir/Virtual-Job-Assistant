# This file contains the model for Resume
from app import db
from datetime import datetime

class Resume(db.Model):
    __tablename__ = 'resumes'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    contact = db.Column(db.Text, nullable=True)  # JSON string for contact info
    skills = db.Column(db.Text, nullable=True)  # JSON array as string
    experiences = db.Column(db.Text, nullable=True)  # JSON array as string
    certifications = db.Column(db.Text, nullable=True)  # JSON array as string
    projects = db.Column(db.Text, nullable=True)  # JSON array as string
    education = db.Column(db.Text, nullable=True)  # JSON array as string
    pdf_resume = db.Column(db.String(255), nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with User
    user = db.relationship('User', backref=db.backref('resume', lazy=True, cascade="all, delete-orphan"))
    
    def __repr__(self):
        return f'<Resume {self.id} for Employee {self.employee_id}>'