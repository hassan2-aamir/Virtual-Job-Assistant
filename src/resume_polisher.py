# Import necessary packages
import os
from dotenv import load_dotenv
import requests
import json
import gradio as gr
load_dotenv()

API_KEY = os.getenv("API_KEY")
MODEL_ID = "deepseek/deepseek-r1-distill-llama-70b:free"


# Function to polish the resume using the model
def polish_resume(position_name, resume_content, polish_prompt=""):
    # Headers for authentication
    headers={
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    }

    # Check if polish_prompt is provided and adjust the combined_prompt accordingly
    if polish_prompt and polish_prompt.strip():
        prompt = f"Given the resume content: '{resume_content}', polish it based on the following instructions: {polish_prompt} for the {position_name} position."
    else:
        prompt = f"Suggest improvements for the following resume content: '{resume_content}' to better align with the requirements and expectations of a {position_name} position. Return the polished version, highlighting necessary adjustments for clarity, relevance, and impact in relation to the targeted role."
    
    # Request payload
    payload = {
    "model": "deepseek/deepseek-r1-distill-llama-70b:free",
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
            #print(result)
            return result['choices'][0]['message']['content']
        else:
            return f"Error: {response['status_code']} - {response['text']}"
            
    except requests.exceptions.RequestException as e:
        return f"Request failed: {str(e)}"

# Create Gradio interface for the resume polish application
resume_polish_application = gr.Interface(
    fn=polish_resume,
    inputs=[
        gr.Textbox(label="Position Name", placeholder="Enter the name of the position..."),
        gr.Textbox(label="Resume Content", placeholder="Paste your resume content here...", lines=20),
        gr.Textbox(label="Polish Instruction (Optional)", placeholder="Enter specific instructions or areas for improvement (optional)...", lines=2),
    ],
    outputs=gr.Textbox(label="Polished Content"),
    title="Resume Polish Application",
    description="This application helps you polish your resume. Enter the position you want to apply, your resume content, and specific instructions or areas for improvement (optional), then get a polished version of your content."
)

# Launch the application
if __name__ == "__main__":
    resume_polish_application.launch()