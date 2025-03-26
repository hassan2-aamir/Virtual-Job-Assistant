import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FileText, Copy, Download, RefreshCw, Loader2,
  Briefcase, FileUp, AlertCircle, ClipboardList,
  Sparkles, FileDigit
} from "lucide-react";
import { API_BASE_URL } from "@/config";
import { extractTextFromPdf } from "@/lib/api";

export default function ResumePolisherPage() {
  const [formData, setFormData] = useState({
    position_name: "",
    resume_content: "",
    polish_prompt: "",
    output_format: "text"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, output_format: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    const file = e.target.files?.[0];
    if (!file) {
      setError("No file selected");
      return;
    }
    
    if (file.type !== 'application/pdf') {
      setError("Please upload a PDF file");
      return;
    }
    
    setPdfLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const extractedText = await extractTextFromPdf(formData);
      setFormData(prev => ({ ...prev, resume_content: extractedText.text }));
    } catch (err: any) {
      console.error("PDF extraction error:", err);
      setError(`Failed to extract text: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/polish-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to polish resume');
      }
      
      const data = await response.json();
      setResult(data.polished_resume);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Polisher</h1>
          <p className="text-muted-foreground mt-1">Refine and enhance your resume with AI assistance.</p>
        </div>
        <div className="hidden md:block">
          <FileDigit className="h-12 w-12 text-primary/60" />
        </div>
      </div>

      <Card className="border-2 border-border/40 shadow-md">
        <CardHeader>
          <CardTitle>AI Resume Enhancement</CardTitle>
          <CardDescription>Optimize your resume for job applications and ATS systems</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="position_name" className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-4 w-4" /> Target Position
              </label>
              <Input
                id="position_name"
                name="position_name"
                placeholder="Enter the position you're applying for"
                value={formData.position_name}
                onChange={handleChange}
                required
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
            
            <div className="space-y-2">
              <label htmlFor="polish_prompt" className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4" /> Polishing Instructions
              </label>
              <Textarea
                id="polish_prompt"
                name="polish_prompt"
                placeholder="Add any specific instructions for polishing your resume (e.g., 'Highlight leadership experience', 'Focus on technical skills')"
                value={formData.polish_prompt}
                onChange={handleChange}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">Optional: Provide instructions to guide the AI</p>
            </div>
            
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  <span>Polishing your resume...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FileUp className="h-4 w-4" /> Polish My Resume
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
                <h3 className="text-xl font-medium">Your Polished Resume</h3>
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
              <div className="p-6 bg-muted/50 rounded-md whitespace-pre-wrap border border-border/30 shadow-sm font-mono text-sm">
                {formData.output_format === "html" ? (
                  <div dangerouslySetInnerHTML={{ __html: result }} />
                ) : (
                  result
                )}
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Start Over
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}