import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CoverLetterGeneratorPage() {
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
          <p>Cover letter generation functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

