import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MyApplicationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Applications</h1>
      <p className="text-muted-foreground">Track the status of your job applications.</p>

      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>View your pending, accepted, and rejected applications</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Application tracking functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

