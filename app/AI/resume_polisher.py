# Import necessary packages
import os
from dotenv import load_dotenv
import requests
import json
import gradio as gr
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

load_dotenv()

API_KEY = os.getenv("API_KEY")
MODEL_ID = "deepseek/deepseek-r1-distill-llama-70b:free"


# Function to polish the resume using the model
def polish_resume(position_name, resume_content, polish_prompt="", format="text"):
    # Headers for authentication
    headers={
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    }

    # Check if polish_prompt is provided and adjust the combined_prompt accordingly
    if polish_prompt and polish_prompt.strip():
        prompt = f"Given the resume content: '{resume_content}', polish it based on the following instructions: {polish_prompt} for the {position_name} position. MAKE SURE NOT TO INCLUDE ANY EXPLANATORY TEXT BEFORE AND AFTER THE RESUME CONTENT. USE * TO INDICATE HEADINGS AND - TO INDICATE BULLET POINTS. ALWAYS START WITH THE NAME IN FIRST LINE"
    else:
        prompt = f"Suggest improvements for the following resume content: '{resume_content}' to better align with the requirements and expectations of a {position_name} position. Return the polished version, highlighting necessary adjustments for clarity, relevance, and impact in relation to the targeted role. MAKE SURE NOT TO INCLUDE ANY EXPLANATORY TEXT BEFORE AND AFTER THE RESUME CONTENT. USE * TO INDICATE HEADINGS AND - TO INDICATE BULLET POINTS. ALWAYS START WITH THE NAME IN FIRST LINE"
    
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
            content = result['choices'][0]['message']['content']
            return content
        else:
            return f"Error: {response.status_code} - {response.text}"
            
    except requests.exceptions.RequestException as e:
        return f"Request failed: {str(e)}"


# ...existing code...

# Function to convert text to PDF
def create_resume_pdf(resume_content, position_name):
    # Create a BytesIO object to store the PDF
    buffer = BytesIO()
    
    # Create the PDF document
    doc = SimpleDocTemplate(buffer, pagesize=letter, 
                          rightMargin=72, leftMargin=72,
                          topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    # Define custom styles
    title_style = ParagraphStyle(
        'Title', 
        parent=styles['Heading1'], 
        fontSize=18, 
        alignment=1,
        spaceAfter=12,
        leading=22
    )
    
    section_style = ParagraphStyle(
        'Section', 
        parent=styles['Heading2'], 
        fontSize=14, 
        textColor=colors.navy,
        spaceBefore=12,
        spaceAfter=6,
        borderWidth=0,
        borderPadding=0,
        borderColor=colors.navy,
        borderRadius=None,
        leading=16
    )
    
    subsection_style = ParagraphStyle(
        'SubSection', 
        parent=styles['Heading3'], 
        fontSize=12, 
        textColor=colors.black,
        spaceBefore=6,
        spaceAfter=2,
        leading=14,
        fontName="Helvetica-Bold"
    )
    
    date_style = ParagraphStyle(
        'Date',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.darkgrey,
        alignment=2,  # Right alignment
        fontName="Helvetica-Oblique",
        spaceAfter=2
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles["Normal"],
        fontSize=11,
        spaceAfter=4,
        leading=14
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles["Normal"],
        fontSize=11,
        leftIndent=20,
        firstLineIndent=-15,
        spaceAfter=2,
        leading=14
    )
    
    contact_style = ParagraphStyle(
        'Contact',
        parent=styles["Normal"],
        fontSize=10,
        alignment=1,  # Center alignment
        spaceAfter=10
    )
    
    # Process content into elements for the PDF
    elements = []
    
    # Split the resume content into lines
    lines = resume_content.split('\n')
    
    # Process each line
    current_section = None
    is_contact_info = True  # Assume the first non-title lines are contact info
    
    # First line is usually the name - make it the title
    if lines:
        elements.append(Paragraph(lines[0], title_style))
        lines = lines[1:]  # Skip the first line in further processing
    
    # Process up to 3 lines as contact information (centered)
    contact_info = []
    line_index = 0
    
    while line_index < len(lines) and line_index < 3:
        line = lines[line_index].strip()
        if not line:
            is_contact_info = False
            break
        
        # Check if it looks like contact info (emails, phone, URLs)
        has_contact_markers = any(marker in line.lower() for marker in 
                              ['@', 'phone', 'tel', 'email', 'linkedin', 'github', 'http', '.com'])
        if has_contact_markers:
            contact_info.append(line)
            line_index += 1
        else:
            break
    
    # Add contact info if found
    if contact_info:
        elements.append(Paragraph(" | ".join(contact_info), contact_style))
        lines = lines[line_index:]  # Skip the processed lines
    
    # Process remaining content
    in_bullet_list = False
    
    for line in lines:
        line = line.strip()
        if not line:
            in_bullet_list = False  # End bullet list on empty line
            continue
        
        # Section headers - all caps, ends with colon, or bold-looking
        if line.isupper() or line.endswith(':') or line.startswith('**') and line.endswith('**') or line.startswith('*'):
            current_section = line.strip(':').strip('*')
            clean_section = current_section.strip()
            elements.append(Paragraph(clean_section, section_style))
            in_bullet_list = False
        
        # Subsection headers - typically have dates on the same line or company/university names
        elif ' - ' in line and not line.startswith('-') and not in_bullet_list:
            # Check if this line has a date pattern
            has_date = any(date_marker in line.lower() for date_marker in 
                         ['present', '20', '19', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                          'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
            
            if has_date or current_section in ['EXPERIENCE', 'EDUCATION', 'WORK EXPERIENCE']:
                parts = line.split(' - ', 1)
                if len(parts) == 2:
                    elements.append(Paragraph(parts[0], subsection_style))
                    elements.append(Paragraph(parts[1], date_style))
                else:
                    elements.append(Paragraph(line, subsection_style))
            else:
                elements.append(Paragraph(line, normal_style))
            
            in_bullet_list = False
            
        # Bullet points
        elif line.startswith('-') or line.startswith('•'):
            bullet_text = line[1:].strip()
            elements.append(Paragraph(f"• {bullet_text}", bullet_style))
            in_bullet_list = True
            
        # Normal text
        else:
            elements.append(Paragraph(line, normal_style))
            in_bullet_list = False
    
    # Build the PDF
    doc.build(elements)
    
    # Get the PDF content
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return pdf_content

# ...existing code...

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