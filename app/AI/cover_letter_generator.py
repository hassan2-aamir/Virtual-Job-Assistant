import os
from dotenv import load_dotenv
import requests
import json
import gradio as gr
load_dotenv()

API_KEY = os.getenv("API_KEY")
MODEL_ID = "deepseek/deepseek-r1-distill-llama-70b:free"

def generate_cover_letter(company_name, position_name, job_description, resume_content):
    # Headers for authentication
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    # Craft the prompt for the model to generate a cover letter
    prompt = f"""Generate a customized cover letter using the company name: {company_name}, the position applied for: {position_name}, and the job description: {job_description}. Ensure the cover letter highlights my qualifications and experience as detailed in the resume content: {resume_content}. Adapt the content carefully to avoid including experiences not present in my resume but mentioned in the job description. The goal is to emphasize the alignment between my existing skills and the requirements of the role."""

    # Request payload
    payload = {
        "model": MODEL_ID,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
    }

    try:
        # Make API request
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload),
        )
        
        # Handle response
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            return f"Error: {response.status_code} - {response.text}"
            
    except requests.exceptions.RequestException as e:
        return f"Request failed: {str(e)}"

# Create Gradio interface for the cover letter generation application
cover_letter_app = gr.Interface(
    fn=generate_cover_letter,
    inputs=[
        gr.Textbox(label="Company Name", placeholder="Enter the name of the company..."),
        gr.Textbox(label="Position Name", placeholder="Enter the name of the position..."),
        gr.Textbox(label="Job Description Information", placeholder="Paste the job description here...", lines=10),
        gr.Textbox(label="Resume Content", placeholder="Paste your resume content here...", lines=10),
    ],
    outputs=gr.Textbox(label="Customized Cover Letter"),
    title="Customized Cover Letter Generator",
    description="Generate a customized cover letter by entering the company name, position name, job description and your resume."
)

# Launch the application
if __name__ == "__main__":
    cover_letter_app.launch()
