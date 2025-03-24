-- Create Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role SMALLINT CHECK (role IN (1, 2)), -- 1: Employee, 2: Employer
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255), 
    signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create Jobs Table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    job_type VARCHAR(50) CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Remote')),
    status VARCHAR(20) CHECK (status IN ('Open', 'Closed', 'Expired')) DEFAULT 'Open',
    date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Resumes Table
CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    skills TEXT,
    experiences TEXT,
    certifications TEXT,
    portfolio JSON, -- Stores labeled portfolio links
    education TEXT,
    pdf_resume VARCHAR(255), -- Stores file path
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Applications Table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    employee_id INT,
    application_status VARCHAR(50) CHECK (application_status IN ('Pending', 'Accepted', 'Rejected')) DEFAULT 'Pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resume_link VARCHAR(255), -- Stores resume file used for this application
    UNIQUE(employee_id, job_id), -- Prevents duplicate applications
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);