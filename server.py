from flask import Flask, render_template, request, jsonify, Response, make_response
import os
from dotenv import load_dotenv
from src.cover_letter_generator import generate_cover_letter
from src.resume_polisher import polish_resume, create_resume_pdf
import PyPDF2
from werkzeug.utils import secure_filename
import tempfile

# Load environment variables
load_dotenv()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/generate-cover-letter', methods=['POST'])
def cover_letter_api():
    data = request.json
    
    company_name = data.get('company_name', '')
    position_name = data.get('position_name', '')
    job_description = data.get('job_description', '')
    resume_content = data.get('resume_content', '')
    
    if not all([company_name, position_name, job_description, resume_content]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        cover_letter = generate_cover_letter(
            company_name, 
            position_name, 
            job_description, 
            resume_content
        )
        return jsonify({'cover_letter': cover_letter})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/polish-resume', methods=['POST'])
def resume_api():
    data = request.json
    
    position_name = data.get('position_name', '')
    resume_content = data.get('resume_content', '')
    polish_prompt = data.get('polish_prompt', '')
    output_format = data.get('output_format', 'text')
    
    if not all([position_name, resume_content]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        polished_resume = polish_resume(
            position_name,
            resume_content,
            polish_prompt
        )
        
        if output_format == 'pdf':
            # Return both text and a flag indicating PDF is available
            return jsonify({
                'polished_resume': polished_resume,
                'pdf_available': True
            })
        else:
            return jsonify({'polished_resume': polished_resume})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-resume-pdf', methods=['POST'])
def download_resume_pdf():
    data = request.json
    
    resume_content = data.get('resume_content', '')
    position_name = data.get('position_name', '')
    
    if not resume_content:
        return jsonify({'error': 'Missing resume content'}), 400
    
    try:
        pdf_content = create_resume_pdf(resume_content, position_name)
        
        response = make_response(pdf_content)
        response.headers.set('Content-Type', 'application/pdf')
        response.headers.set('Content-Disposition', f'attachment; filename="{position_name.replace(" ", "_")}_resume.pdf"')
        
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract-pdf-text', methods=['POST'])
def extract_pdf_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            file.save(temp.name)
            temp_name = temp.name
        
        # Extract text from PDF
        text = ''
        with open(temp_name, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page_num in range(len(pdf_reader.pages)):
                text += pdf_reader.pages[page_num].extract_text()
        
        # Delete the temporary file
        os.unlink(temp_name)
        
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)