import { useState } from "react";
import { generateCoverLetter } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoverLetterGeneratorPage() {
  const [formData, setFormData] = useState({
    company_name: "",
    position_name: "",
    job_description: "",
    resume_content: "",
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cover Letter Generator</h1>
      <p className="text-muted-foreground">Create customized cover letters with AI assistance.</p>

      <Card>
        <CardHeader>
          <CardTitle>AI Cover Letter Creation</CardTitle>
          <CardDescription>Generate tailored cover letters for your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="position_name"
              placeholder="Position Name"
              value={formData.position_name}
              onChange={handleChange}
              required
            />
            <textarea
              name="job_description"
              placeholder="Job Description"
              value={formData.job_description}
              onChange={handleChange}
              required
            />
            <textarea
              name="resume_content"
              placeholder="Resume Content"
              value={formData.resume_content}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Cover Letter"}
            </button>
          </form>
          {error && <p className="text-red-500">{error}</p>}
          {result && <pre className="mt-4 p-4 bg-gray-100">{result}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}