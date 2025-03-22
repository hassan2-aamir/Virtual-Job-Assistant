import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SearchJobsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Search Jobs</h1>
      <p className="text-muted-foreground">Explore and browse job postings as an employee.</p>

      <Card>
        <CardHeader>
          <CardTitle>Job Search</CardTitle>
          <CardDescription>Find your next opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Job search functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

