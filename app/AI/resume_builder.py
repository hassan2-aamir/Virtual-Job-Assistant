from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO

def create_resume_pdf(position_name, social_media1, social_media2, education, experience, certifications, projects, skills):
    """
    Creates a PDF resume using the provided details.
    
    Args:
        position_name (str): Title/Position name
        social_media1 (str): LinkedIn profile URL or other social media
        social_media2 (str): GitHub profile URL or other social media
        education (list): List of education entries
        experience (list): List of experience entries
        certifications (list): List of certifications
        projects (list): List of projects
        skills (list): List of skills
    
    Returns:
        bytes: PDF content as bytes
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Title style
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Title'],
        fontSize=18,
        textColor=colors.darkblue,
        spaceAfter=12
    )
    
    # Section heading style
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.darkblue,
        spaceAfter=6
    )
    
    # Regular text style
    normal_style = styles['Normal']
    
    # Add title
    elements.append(Paragraph(position_name, title_style))
    elements.append(Spacer(1, 12))
    
    # Add social media links
    if social_media1:
        elements.append(Paragraph(f"LinkedIn: {social_media1}", normal_style))
    if social_media2:
        elements.append(Paragraph(f"GitHub: {social_media2}", normal_style))
    
    elements.append(Spacer(1, 12))
    
    # Add Skills section
    if skills:
        elements.append(Paragraph("Skills", heading_style))
        skill_text = ", ".join(skills)
        elements.append(Paragraph(skill_text, normal_style))
        elements.append(Spacer(1, 12))
    
    # Add Experience section
    if experience:
        elements.append(Paragraph("Experience", heading_style))
        for exp in experience:
            company = exp.get('company', '')
            position = exp.get('position', '')
            date = exp.get('date', '')
            description = exp.get('description', [])
            
            elements.append(Paragraph(f"<b>{position}</b> at {company}, {date}", normal_style))
            
            for desc in description:
                if desc.strip():  # Only add non-empty descriptions
                    elements.append(Paragraph(f"• {desc}", normal_style))
            
            elements.append(Spacer(1, 6))
        
        elements.append(Spacer(1, 6))
    
    # Add Education section
    if education:
        elements.append(Paragraph("Education", heading_style))
        for edu in education:
            institution = edu.get('institution', '')
            degree = edu.get('degree', '')
            date = edu.get('date', '')
            
            elements.append(Paragraph(f"<b>{degree}</b> from {institution}, {date}", normal_style))
        
        elements.append(Spacer(1, 12))
    
    # Add Projects section
    if projects:
        elements.append(Paragraph("Projects", heading_style))
        for project in projects:
            name = project.get('name', '')
            url = project.get('url', '')
            date = project.get('date', '')
            description = project.get('description', [])
            
            project_title = f"<b>{name}</b>"
            if url:
                project_title += f" - {url}"
            if date:
                project_title += f", {date}"
                
            elements.append(Paragraph(project_title, normal_style))
            
            for desc in description:
                if desc.strip():  # Only add non-empty descriptions
                    elements.append(Paragraph(f"• {desc}", normal_style))
            
            elements.append(Spacer(1, 6))
        
        elements.append(Spacer(1, 6))
    
    # Add Certifications section
    if certifications:
        elements.append(Paragraph("Certifications", heading_style))
        for cert in certifications:
            if isinstance(cert, str) and cert.strip():
                elements.append(Paragraph(f"• {cert}", normal_style))
        
        elements.append(Spacer(1, 12))
    
    # Build the PDF
    doc.build(elements)
    
    # Get the PDF content
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return pdf_content