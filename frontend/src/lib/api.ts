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