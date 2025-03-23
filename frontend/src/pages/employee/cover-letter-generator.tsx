import { useState } from "react";
import { generateCoverLetter, extractTextFromPdf } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {  Upload ,  FileText, Copy, Download, RefreshCw, Loader2, Building2, 
  Briefcase, Sparkles, AlertCircle, ClipboardList } from "lucide-react";


export default function CoverLetterGeneratorPage() {
  const [formData, setFormData] = useState({
    company_name: "",
    position_name: "",
    job_description: "",
    resume_content: "",
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError("Please upload a PDF file");
      return;
    }
    
    setPdfLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const extractedText = await extractTextFromPdf(formData);
      setFormData(prev => ({ ...prev, resume_content: extractedText.text }));
    } catch (err: any) {
      setError(`Failed to extract text from PDF: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await generateCoverLetter(formData);
      setResult(response.cover_letter);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Replace the entire return statement (from line ~64 onwards) with this code:

return (
  <>
  <div className="container max-w-4xl mx-auto space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-1">Create customized cover letters with AI assistance.</p>
      </div>
      <div className="hidden md:block">
        <FileText className="h-12 w-12 text-primary/60" />
      </div>
    </div>

    <Card className="border-2 border-border/40 shadow-md">
      <CardHeader>
        <CardTitle>AI Cover Letter Creation</CardTitle>
        <CardDescription>Generate tailored cover letters for your job applications</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="company_name" className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4" /> Company Name
              </label>
              <Input
                id="company_name"
                name="company_name"
                placeholder="Enter company name"
                value={formData.company_name}
                onChange={handleChange}
                required
                className="border-input/60 focus-visible:ring-primary/70"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="position_name" className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-4 w-4" /> Position Name
              </label>
              <Input
                id="position_name"
                name="position_name"
                placeholder="Enter position name"
                value={formData.position_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="job_description" className="flex items-center gap-2 text-sm font-medium">
              <ClipboardList className="h-4 w-4" /> Job Description
            </label>
            <Textarea
              id="job_description"
              name="job_description"
              placeholder="Paste the job description here"
              value={formData.job_description}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="resume_content" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" /> Resume Content
            </label>
            <div className="flex gap-2 mb-2 items-center">
              <div className="border rounded p-2 flex-1 bg-muted/30">
                <Input
                  type="file"
                  accept=".pdf"
                  id="resume_pdf"
                  onChange={handleFileUpload}
                  className="w-full text-sm"
                />
              </div>
              {pdfLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
            <Textarea
              id="resume_content"
              name="resume_content"
              placeholder="Upload a PDF or manually enter your resume content"
              value={formData.resume_content}
              onChange={handleChange}
              required
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 
                <span>Generating your cover letter...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" /> Generate Cover Letter
              </div>
            )}
          </Button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {result && (
          <div className="mt-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium">Your Cover Letter</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                <Copy className="h-4 w-4" />
                Copy Text
              </Button>
            </div>
            <div className="p-6 bg-muted/50 rounded-md whitespace-pre-wrap border border-border/30 shadow-sm">
              {result}
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                <RefreshCw className="h-4 w-4 mr-2" /> Start Over
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
  </>
);
}