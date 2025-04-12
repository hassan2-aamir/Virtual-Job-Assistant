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
CREATE TABLE `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employer_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `company` varchar(255) NOT NULL,
  `requirements` text,
  `location` varchar(255) DEFAULT NULL,
  `salary` varchar(100) DEFAULT NULL,
  `job_type` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint DEFAULT NULL,
  `application_count` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employer_id` (`employer_id`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `jobs_chk_1` CHECK ((`job_type` in (_utf8mb4'Full-time',_utf8mb4'Part-time',_utf8mb4'Contract',_utf8mb4'Remote'))),
  CONSTRAINT `jobs_chk_2` CHECK ((`status` in (_utf8mb4'Open',_utf8mb4'Closed',_utf8mb4'Expired')))
);

-- Create Resumes Table
CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    contact TEXT,
    skills TEXT,
    experiences TEXT,
    certifications TEXT,
    projects TEXT, -- Stores labeled portfolio links
    education TEXT,
    pdf_resume VARCHAR(255), -- Stores file path
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Applications Table
CREATE TABLE `job_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cover_letter` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`,`job_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `job_applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_applications_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`)
);

