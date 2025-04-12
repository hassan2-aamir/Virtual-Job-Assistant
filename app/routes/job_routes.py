from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User
from app.models.job import Job, JobApplication
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json

# Create a model for Job
from flask_sqlalchemy import SQLAlchemy
from app import db


# Create a Blueprint for the job routes
job_bp = Blueprint('job_bp', __name__)

# Enable CORS for the job_bp Blueprint
CORS(job_bp)

# Get all jobs with optional filters
@job_bp.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        # Get query parameters for filtering
        title = request.args.get('title')
        location = request.args.get('location')
        job_type = request.args.get('job_type')
        
        # Start with base query
        query = Job.query.filter_by(is_active=True)
        
        # Apply filters if provided
        if title:
            query = query.filter(Job.title.ilike(f'%{title}%'))
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))
        if job_type:
            query = query.filter(Job.job_type == job_type)
        
        # Execute query and get results
        jobs = query.order_by(Job.created_at.desc()).all()
        
        # Convert to JSON
        jobs_list = []
        for job in jobs:
            jobs_list.append({
                'id': job.id,
                'employer_id': job.employer_id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'job_type': job.job_type,
                'salary': job.salary,
                'description': job.description,
                'requirements': job.requirements,
                'created_at': job.created_at.isoformat(),
                'updated_at': job.updated_at.isoformat() if job.updated_at else None
            })
        
        return jsonify(jobs_list)
    except Exception as e:
        current_app.logger.error(f"Error getting jobs: {str(e)}")
        return jsonify({'error': f'Error getting jobs: {str(e)}'}), 500

# Get job by ID
@job_bp.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    try:
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        job_data = {
            'id': job.id,
            'employer_id': job.employer_id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'job_type': job.job_type,
            'salary': job.salary,
            'description': job.description,
            'requirements': job.requirements,
            'created_at': job.created_at.isoformat(),
            'updated_at': job.updated_at.isoformat() if job.updated_at else None
        }
        
        return jsonify(job_data)
    except Exception as e:
        current_app.logger.error(f"Error getting job: {str(e)}")
        return jsonify({'error': f'Error getting job: {str(e)}'}), 500

# Create a new job (requires employer authentication)
@job_bp.route('/api/jobs', methods=['POST'])
@jwt_required()
def create_job():
    try:
        # Get the current user's ID from JWT
        current_user_id = get_jwt_identity()
        if not isinstance(current_user_id, str):
            return jsonify({"msg": "Subject must be a string"}), 422
        
        # Check if the user is an employer
        user = User.query.get(current_user_id)
        if not user or user.role != 'employer':
            return jsonify({'error': 'Only employers can create jobs'}), 403
        
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'company', 'description']
        if not data or not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Create a new job
        job = Job(
            employer_id=int(current_user_id),
            title=data['title'],
            company=data['company'],
            location=data.get('location', ''),
            job_type=data.get('job_type', ''),
            salary=data.get('salary', ''),
            description=data['description'],
            requirements=data.get('requirements', '')
        )
        
        # Add to database
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job created successfully',
            'id': job.id
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating job: {str(e)}")
        return jsonify({'error': f'Error creating job: {str(e)}'}), 500

# Update an existing job (requires employer authentication)
@job_bp.route('/api/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    try:
        # Get the current user's ID from JWT
        current_user_id = get_jwt_identity()
        if not isinstance(current_user_id, str):
            return jsonify({"msg": "Subject must be a string"}), 422
        
        # Find the job
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Check if the user is the employer who created this job
        if int(current_user_id) != job.employer_id:
            return jsonify({'error': 'You can only update your own jobs'}), 403
        
        data = request.json
        
        # Update job fields
        if 'title' in data:
            job.title = data['title']
        if 'company' in data:
            job.company = data['company']
        if 'location' in data:
            job.location = data['location']
        if 'job_type' in data:
            job.job_type = data['job_type']
        if 'salary' in data:
            job.salary = data['salary']
        if 'description' in data:
            job.description = data['description']
        if 'requirements' in data:
            job.requirements = data['requirements']
        if 'is_active' in data:
            job.is_active = data['is_active']
        
        # Update the updated_at timestamp
        job.updated_at = datetime.utcnow()
        
        # Commit changes
        db.session.commit()
        
        return jsonify({
            'message': 'Job updated successfully',
            'id': job.id
        })
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating job: {str(e)}")
        return jsonify({'error': f'Error updating job: {str(e)}'}), 500

# Delete a job (requires employer authentication)
@job_bp.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    try:
        # Get the current user's ID from JWT
        current_user_id = get_jwt_identity()
        if not isinstance(current_user_id, str):
            return jsonify({"msg": "Subject must be a string"}), 422
        
        # Find the job
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Check if the user is the employer who created this job
        if int(current_user_id) != job.employer_id:
            return jsonify({'error': 'You can only delete your own jobs'}), 403
        
        # Delete job
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({'message': 'Job deleted successfully'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting job: {str(e)}")
        return jsonify({'error': f'Error deleting job: {str(e)}'}), 500

# Get all jobs posted by the current employer
@job_bp.route('/api/employer/jobs', methods=['GET'])
@jwt_required()
def get_employer_jobs():
    try:
        # Get the current user's ID from JWT
        current_user_id = get_jwt_identity()
        if not isinstance(current_user_id, str):
            return jsonify({"msg": "Subject must be a string"}), 422
        
        # Get all jobs for this employer
        jobs = Job.query.filter_by(employer_id=int(current_user_id)).order_by(Job.created_at.desc()).all()
        
        # Convert to JSON
        jobs_list = []
        for job in jobs:
            jobs_list.append({
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'job_type': job.job_type,
                'salary': job.salary,
                'description': job.description,
                'requirements': job.requirements,
                'created_at': job.created_at.isoformat(),
                'updated_at': job.updated_at.isoformat() if job.updated_at else None,
                'is_active': job.is_active,
                'application_count': JobApplication.query.filter_by(job_id=job.id).count()
            })
        
        return jsonify(jobs_list)
    except Exception as e:
        current_app.logger.error(f"Error getting employer jobs: {str(e)}")
        return jsonify({'error': f'Error getting employer jobs: {str(e)}'}), 500

# Apply for a job (requires employee authentication)
@job_bp.route('/api/jobs/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_for_job(job_id):
    try:
        # Get the current user's ID from JWT
        current_user_id = get_jwt_identity()
        if not isinstance(current_user_id, str):
            return jsonify({"msg": "Subject must be a string"}), 422
        
        # Check if the user is an employee
        user = User.query.get(current_user_id)
        if not user or user.role != 'employee':
            return jsonify({'error': 'Only employees can apply for jobs'}), 403
        
        # Check if the job exists
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Check if already applied
        existing_application = JobApplication.query.filter_by(
            job_id=job_id, 
            employee_id=int(current_user_id)
        ).first()
        
        if existing_application:
            return jsonify({'error': 'You have already applied for this job'}), 400
        
        data = request.json or {}
        
        # Create job application
        application = JobApplication(
            job_id=job_id,
            employee_id=int(current_user_id),
            cover_letter=data.get('cover_letter', '')
        )
        
        # Add to database
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
            'message': 'Application submitted successfully',
            'id': application.id
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error applying for job: {str(e)}")
        return jsonify({'error': f'Error applying for job: {str(e)}'}), 500

# Get all applications for a specific job (requires employer authentication)
@job_bp.route('/api/jobs/<int:job_id>/applications', methods=['GET'])
@jwt_required()
def get_job_applications(job_id):
    try:
        # Get the current user's ID from JWT
        current_user_id = get_jwt_identity()
        if not isinstance(current_user_id, str):
            return jsonify({"msg": "Subject must be a string"}), 422
        
        # Find the job
        job = Job.query.get(job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Check if the user is the employer who created this job
        if int(current_user_id) != job.employer_id:
            return jsonify({'error': 'You can only view applications for your own jobs'}), 403
        
        # Get all applications for this job
        applications = JobApplication.query.filter_by(job_id=job_id).all()
        
        # Convert to JSON with employee details
        applications_list = []
        for application in applications:
            employee = User.query.get(application.employee_id)
            applications_list.append({
                'id': application.id,
                'job_id': application.job_id,
                'employee_id': application.employee_id,
                'employee_name': employee.name if employee else 'Unknown',
                'employee_email': employee.email if employee else '',
                'status': application.status,
                'applied_at': application.applied_at.isoformat(),
                'updated_at': application.updated_at.isoformat() if application.updated_at else None,
                'cover_letter': application.cover_letter
            })
        
        return jsonify(applications_list)
    except Exception as e:
        current_app.logger.error(f"Error getting job applications: {str(e)}")
        return jsonify({'error': f'Error getting job applications: {str(e)}'}), 500

# Get all applications by the current employee
@job_bp.route('/api/employee/applications', methods=['GET'])
@jwt_required()
def get_employee_applications():
    try:
        # Get the current user's ID from JWT
        current_user_id = get_jwt_identity()
        if not isinstance(current_user_id, str):
            return jsonify({"msg": "Subject must be a string"}), 422
        
        # Check if the user is an employee
        user = User.query.get(current_user_id)
        if not user or user.role != 'employee':
            return jsonify({'error': 'Only employees can view their applications'}), 403
        
        # Get all applications for this employee
        applications = JobApplication.query.filter_by(employee_id=int(current_user_id)).all()
        
        # Convert to JSON with job details
        applications_list = []
        for application in applications:
            job = Job.query.get(application.job_id)
            applications_list.append({
                'id': application.id,
                'job_id': application.job_id,
                'job_title': job.title if job else 'Unknown',
                'company': job.company if job else '',
                'location': job.location if job else '',
                'status': application.status,
                'applied_at': application.applied_at.isoformat(),
                'updated_at': application.updated_at.isoformat() if application.updated_at else None
            })
        
        return jsonify(applications_list)
    except Exception as e:
        current_app.logger.error(f"Error getting employee applications: {str(e)}")
        return jsonify({'error': f'Error getting employee applications: {str(e)}'}), 500

# Update application status (requires employer authentication)
@job_bp.route('/api/applications/<int:application_id>/status', methods=['PATCH'])
@jwt_required()
def update_application_status(application_id):
    try:
        # Get the current user's ID from JWT
        current_user_id = get_jwt_identity()
        if not isinstance(current_user_id, str):
            return jsonify({"msg": "Subject must be a string"}), 422
        
        # Find the application
        application = JobApplication.query.get(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Find the job
        job = Job.query.get(application.job_id)
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        # Check if the user is the employer who created this job
        if int(current_user_id) != job.employer_id:
            return jsonify({'error': 'You can only update applications for your own jobs'}), 403
        
        data = request.json
        
        # Validate status
        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        valid_statuses = ['pending', 'invited', 'rejected']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
        
        # Update status
        application.status = data['status']
        application.updated_at = datetime.utcnow()
        
        # Commit changes
        db.session.commit()
        
        return jsonify({
            'message': 'Application status updated successfully',
            'id': application.id,
            'status': application.status
        })
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating application status: {str(e)}")
        return jsonify({'error': f'Error updating application status: {str(e)}'}), 500