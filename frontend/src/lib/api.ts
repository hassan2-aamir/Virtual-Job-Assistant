import { UserRole } from "@/components/auth/auth-provider";
import { API_BASE_URL } from "@/config";
import axios from "axios";

export async function generateCoverLetter(data: {
  company_name: string;
  position_name: string;
  job_description: string;
  resume_content: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/generate-cover-letter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export async function polishResume(data: {
  position_name: string;
  resume_content: string;
  polish_prompt?: string;
  output_format?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/polish-resume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
}

export async function extractTextFromPdf(formData: FormData): Promise<{ text: string }> {
  console.log("Sending PDF extraction request...");
  
  // Log the form data to verify file is included
  console.log("FormData contents:");
  for (const pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }
  
  const response = await fetch(`${API_BASE_URL}/api/extract-pdf-text`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header when sending FormData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to extract text from PDF');
  }
  
  return await response.json();
}

export async function createUser(data: {
  id?: number;
  name: string;
  email: string;
  role: string;  // Ensure this is passed as a string (e.g., "employee" or "employer")
  password?: string;
  profile_picture?: string;
  signup_date?: string;
  last_login?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check if the response is not okay (status code other than 2xx)
    if (!response.ok) {
      const errorData = await response.json(); // Capture the error details from the response
      console.error('Error during user creation:', errorData);
      throw new Error(`Error: ${errorData.error || response.statusText}`);
    }

    // Return the response JSON if everything goes well
    return response.json();
  } catch (error) {
    console.error('Error during user creation:', error);  // Log any errors for debugging purposes
    throw error; // Re-throw the error to be handled by the calling function
  }
}

// Add this function to your existing api.ts file

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}


export async function switchUserRole(userId: string, newRole: UserRole) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found. Please login again.");
    }

    console.log(`Attempting to set role to: ${newRole}`);
    console.log(`API URL: ${API_BASE_URL}/users/${userId}/role`);

    const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response data:", errorData);
      throw new Error(`Role update failed: ${errorData.message || response.statusText}`);
    }

    const updatedUser = await response.json(); // Assuming the updated user data is returned
    console.log("Role updated successfully:", updatedUser);
    return updatedUser;

  } catch (error) {
    console.error("Switch role error:", error);
    throw error;
  }
}

// Add these functions to your existing api.ts file

// Resume Types
export interface ResumeContactInfo {
  name: string;
  email: string;
  phone: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ResumeExperience {
  company: string;
  position: string;
  date: string;
  description: string[];
}

export interface ResumeProject {
  name: string;
  url?: string;
  date?: string;
  description: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  date: string;
}

export interface Resume {
  id?: number;
  employee_id: number;
  contact: ResumeContactInfo;
  skills: string[];
  experiences: ResumeExperience[];
  certifications: string[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  pdf_resume?: string;
}

// Get user's resume
export async function getResume(userId: string | number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/employee/${userId}`);
    
    if (response.status === 404) {
      return null; // No resume found
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch resume');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
}

// Create a new resume
export async function createResume(resumeData: Resume) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create resume');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
}

// Update existing resume
export async function updateResume(resumeId: number, resumeData: Partial<Resume>) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resumeData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update resume');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating resume:', error);
    throw error;
  }
}

// Download resume as PDF
export async function downloadResumeAsPdf(resumeId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/pdf`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download resume');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.pdf';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Error downloading resume:', error);
    throw error;
  }
}


export async function changePassword(currentPassword: string, newPassword: string) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      currentPassword: currentPassword,  // Change to camelCase to match backend
      newPassword: newPassword           // Change to camelCase to match backend
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Change password error details:", errorData);
    throw new Error(errorData.message || errorData.error || "Failed to change password");
  }

  return response.json();
}

// Job Types
export interface Job {
  id?: number
  title: string
  company: string
  location?: string
  job_type?: string
  salary?: string
  description: string
  requirements?: string
  is_active?: boolean
  created_at?: string
  application_count?: number
}



export interface JobApplication {
  id?: number;
  job_id: number;
  employee_id?: number;
  employee_name?: string;
  employee_email?: string;
  job_title?: string;
  company?: string;
  location?: string;
  status?: string;
  applied_at?: string;
  updated_at?: string;
  cover_letter?: string;
  has_resume_file?: boolean;
}

// Get all jobs with optional filters
export async function getJobs(filters?: { title?: string; location?: string; job_type?: string }) {
  const queryParams = new URLSearchParams();
  
  if (filters?.title) queryParams.append('title', filters.title);
  if (filters?.location) queryParams.append('location', filters.location);
  if (filters?.job_type) queryParams.append('job_type', filters.job_type);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/jobs${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

// Get a single job by ID
export async function getJob(jobId: number) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
}

// Create a new job
export async function createJob(jobData: Job) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/jobs`,
      jobData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

// Update an existing job
export async function updateJob(jobId: number, jobData: Partial<Job>) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/jobs/${jobId}`,
      jobData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating job ${jobId}:`, error);
    throw error;
  }
}

// Delete a job
export async function deleteJob(jobId: number) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/jobs/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error);
    throw error;
  }
}

// Get all jobs posted by the current employer
export async function getEmployerJobs() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/employer/jobs`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    throw error;
  }
}

// Apply for a job
export async function applyForJob(jobId: number, coverLetter?: string, resumeFile?: File) {
  try {
    // If there's a file, use FormData
    if (resumeFile) {
      const formData = new FormData();
      if (coverLetter) formData.append('cover_letter', coverLetter);
      formData.append('resume_file', resumeFile);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/jobs/${jobId}/apply`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } else {
      // No file, use JSON
      const response = await axios.post(
        `${API_BASE_URL}/api/jobs/${jobId}/apply`,
        { cover_letter: coverLetter },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    }
  } catch (error) {
    console.error(`Error applying for job ${jobId}:`, error);
    throw error;
  }
}

// Get all applications for a specific job (for employers)
export async function getJobApplications(jobId: number) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/jobs/${jobId}/applications`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching applications for job ${jobId}:`, error);
    throw error;
  }
}

// Get all applications by the current employee
export async function getEmployeeApplications() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/employee/applications`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching employee applications:', error);
    throw error;
  }
}

// Update application status (for employers)
export async function updateApplicationStatus(applicationId: number, status: 'pending' | 'invited' | 'rejected') {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/api/applications/${applicationId}/status`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating application ${applicationId} status:`, error);
    throw error;
  }
}

// Add a function to download resume file
export async function downloadResumeFile(applicationId: number) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/applications/${applicationId}/resume`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      }
    );
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resume_${applicationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error(`Error downloading resume for application ${applicationId}:`, error);
    throw error;
  }
}