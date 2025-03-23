import { API_BASE_URL } from "@/config";

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