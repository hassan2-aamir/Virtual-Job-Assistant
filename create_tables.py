from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean, CheckConstraint, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database connection details from environment variables
# You'll need to create a .env file with these variables
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "job_portal")

# Create database connection string
DATABASE_URL = os.getenv("DATABASE_URL", f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}")
# Create engine and base
engine = create_engine(DATABASE_URL)
Base = declarative_base()

# Define models
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    role = Column(String(255))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    profile_picture = Column(String(255))
    signup_date = Column(DateTime, server_default=func.current_timestamp())
    last_login = Column(DateTime)

    # Relationships
    jobs = relationship('Job', back_populates='employer', cascade='all, delete')
    applications = relationship('JobApplication', back_populates='employee')
    resume = relationship('Resume', back_populates='employee', uselist=False)


class Job(Base):
    __tablename__ = 'jobs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    employer_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    requirements = Column(Text)
    location = Column(String(255))
    salary = Column(String(100))
    job_type = Column(String(50))
    status = Column(String(20), default='Open')
    created_at = Column(DateTime, server_default=func.current_timestamp())
    description = Column(Text, nullable=False)
    updated_at = Column(DateTime)
    is_active = Column(Boolean)
    application_count = Column(Integer)

    # Relationships
    employer = relationship('User', back_populates='jobs')
    applications = relationship('JobApplication', back_populates='job', cascade='all, delete')

    # Constraints
    __table_args__ = (
        CheckConstraint("job_type IN ('Full-time', 'Part-time', 'Contract', 'Remote')"),
        CheckConstraint("status IN ('Open', 'Closed', 'Expired')"),
    )


class JobApplication(Base):
    __tablename__ = 'job_applications'

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey('jobs.id', ondelete='CASCADE'))
    employee_id = Column(Integer, ForeignKey('users.id'))
    status = Column(String(50), default='Pending')
    applied_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, server_default=func.current_timestamp())
    cover_letter = Column(Text)
    resume_file = Column(String(255))

    # Relationships
    job = relationship('Job', back_populates='applications')
    employee = relationship('User', back_populates='applications')

    # Constraints
    __table_args__ = (
        UniqueConstraint('employee_id', 'job_id', name='employee_id'),
    )


class Resume(Base):
    __tablename__ = 'resumes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    skills = Column(Text)
    experiences = Column(Text)
    certifications = Column(Text)
    projects = Column(Text)
    education = Column(Text)
    pdf_resume = Column(String(255))
    last_updated = Column(DateTime, server_default=func.current_timestamp())
    contact = Column(Text)

    # Relationships
    employee = relationship('User', back_populates='resume')


def create_tables():
    Base.metadata.create_all(engine)


if __name__ == "__main__":
    create_tables()
    print("Database tables created successfully!")