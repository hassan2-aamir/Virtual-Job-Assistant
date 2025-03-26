from flask import Blueprint, request, jsonify, current_app, make_response
from app import db
from app.models.resume import Resume
from app.models.user import User
from app.AI.resume_builder import create_resume_pdf
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import tempfile
from flask_cors import CORS

# Create a Blueprint for the 'resume' routes
resume_bp = Blueprint('resume_bp', __name__)

# Enable CORS for the 'resume_bp' Blueprint
CORS(resume_bp)

# Get resume by employee ID
@resume_bp.route('/api/resumes/employee/<int:employee_id>', methods=['GET'])
def get_resume_by_employee(employee_id):
    try:
        resume = Resume.query.filter_by(employee_id=employee_id).first()
        
        if not resume:
            return jsonify({'message': 'No resume found for this user'}), 404
        
        # Parse JSON strings into Python objects
        resume_data = {
            'id': resume.id,
            'employee_id': resume.employee_id,
            'contact': json.loads(resume.contact) if resume.contact else {},
            'skills': json.loads(resume.skills) if resume.skills else [],
            'experiences': json.loads(resume.experiences) if resume.experiences else [],
            'certifications': json.loads(resume.certifications) if resume.certifications else [],
            'projects': json.loads(resume.projects) if resume.projects else [],
            'education': json.loads(resume.education) if resume.education else [],
            'pdf_resume': resume.pdf_resume,
            'last_updated': resume.last_updated.isoformat()
        }
        
        return jsonify(resume_data)
    except Exception as e:
        current_app.logger.error(f"Error retrieving resume: {str(e)}")
        return jsonify({'error': f'Error retrieving resume: {str(e)}'}), 500

# Create a new resume
@resume_bp.route('/api/resumes', methods=['POST'])
def create_resume():
    try:
        data = request.json
        
        # Validate required fields
        if not data or 'employee_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user exists
        user = User.query.get(data['employee_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if resume already exists for this user
        existing_resume = Resume.query.filter_by(employee_id=data['employee_id']).first()
        if existing_resume:
            return jsonify({'error': 'Resume already exists for this user', 'resume_id': existing_resume.id}), 409
        
        # Create a new resume
        resume = Resume(
            employee_id=data['employee_id'],
            contact=json.dumps(data.get('contact', {})),
            skills=json.dumps(data.get('skills', [])),
            experiences=json.dumps(data.get('experiences', [])),
            certifications=json.dumps(data.get('certifications', [])),
            projects=json.dumps(data.get('projects', [])),
            education=json.dumps(data.get('education', []))
        )
        
        # Add resume to database
        db.session.add(resume)
        db.session.commit()
        
        return jsonify({
            'message': 'Resume created successfully',
            'id': resume.id
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating resume: {str(e)}")
        return jsonify({'error': f'Error creating resume: {str(e)}'}), 500

# Update an existing resume
@resume_bp.route('/api/resumes/<int:resume_id>', methods=['PUT'])
def update_resume(resume_id):
    try:
        data = request.json
        
        # Find the resume
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Update resume fields
        if 'contact' in data:
            resume.contact = json.dumps(data['contact'])
        if 'skills' in data:
            resume.skills = json.dumps(data['skills'])
        if 'experiences' in data:
            resume.experiences = json.dumps(data['experiences'])
        if 'certifications' in data:
            resume.certifications = json.dumps(data['certifications'])
        if 'projects' in data:
            resume.projects = json.dumps(data['projects'])
        if 'education' in data:
            resume.education = json.dumps(data['education'])
        
        # Update last_updated timestamp
        resume.last_updated = datetime.utcnow()
        
        # Commit changes
        db.session.commit()
        
        return jsonify({
            'message': 'Resume updated successfully',
            'id': resume.id
        })
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating resume: {str(e)}")
        return jsonify({'error': f'Error updating resume: {str(e)}'}), 500

# Update only the download_resume_pdf function to match the expected parameters

@resume_bp.route('/api/resumes/<int:resume_id>/pdf', methods=['GET'])
def download_resume_pdf(resume_id):
    try:
        # Find the resume
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Get user information
        user = User.query.get(resume.employee_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Parse JSON data from database
        contact_data = json.loads(resume.contact) if resume.contact else {}
        education_data = json.loads(resume.education) if resume.education else []
        experience_data = json.loads(resume.experiences) if resume.experiences else []
        certifications_data = json.loads(resume.certifications) if resume.certifications else []
        projects_data = json.loads(resume.projects) if resume.projects else []
        skills_data = json.loads(resume.skills) if resume.skills else []
        
        # Extract the required fields for create_resume_pdf
        social_media1 = contact_data.get('linkedin', '')
        social_media2 = contact_data.get('github', '')
        
        # Position name (title for the resume)
        position_name = f"{user.name}'s Resume"
        
        # Generate PDF with all required arguments
        pdf_content = create_resume_pdf(
            position_name,
            social_media1,
            social_media2,
            education_data,
            experience_data,
            certifications_data,
            projects_data,
            skills_data
        )
        
        # Prepare response
        response = make_response(pdf_content)
        response.headers.set('Content-Type', 'application/pdf')
        response.headers.set('Content-Disposition', f'attachment; filename="{user.name.replace(" ", "_")}_resume.pdf"')
        
        return response
    except Exception as e:
        current_app.logger.error(f"Error generating PDF: {str(e)}")
        return jsonify({'error': f'Error generating PDF: {str(e)}'}), 500

# Delete a resume
@resume_bp.route('/api/resumes/<int:resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    try:
        # Find the resume
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Delete resume
        db.session.delete(resume)
        db.session.commit()
        
        return jsonify({'message': 'Resume deleted successfully'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting resume: {str(e)}")
        return jsonify({'error': f'Error deleting resume: {str(e)}'}), 500