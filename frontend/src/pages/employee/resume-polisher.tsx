import { useState } from "react";
import { polishResume } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResumePolisherPage() {
  const [formData, setFormData] = useState({
    position_name: "",
    resume_content: "",
    polish_prompt: "",
    output_format: "text",
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
      const response = await polishResume(formData);
      setResult(response.polished_resume);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Resume Polisher</h1>
      <p className="text-muted-foreground">Polish your resume with AI assistance.</p>

      <Card>
        <CardHeader>
          <CardTitle>AI Resume Polisher</CardTitle>
          <CardDescription>Enhance your resume for specific job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="position_name"
              placeholder="Position Name"
              value={formData.position_name}
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
            <textarea
              name="polish_prompt"
              placeholder="Polish Instructions (Optional)"
              value={formData.polish_prompt}
              onChange={handleChange}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Polishing..." : "Polish Resume"}
            </button>
          </form>
          {error && <p className="text-red-500">{error}</p>}
          {result && <pre className="mt-4 p-4 bg-gray-100">{result}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}