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
