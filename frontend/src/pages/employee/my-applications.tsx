import React, { useState, useEffect } from 'react'
import { getEmployeeApplications, downloadResumeFile, JobApplication } from '@/lib/api'
import { Card, Typography, Tag, Spin, Empty, message, Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const statusColors = {
  pending: 'gold',
  invited: 'green',
  rejected: 'red'
}

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const data = await getEmployeeApplications()
        setApplications(data)
      } catch (error) {
        message.error('Failed to fetch your applications')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()

    // Set up periodic refresh to check for status updates
    const intervalId = setInterval(() => {
      fetchApplications()
    }, 30000) // every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  const renderStatusTag = (status: string = 'pending') => {
    const color = statusColors[status as keyof typeof statusColors] || 'default'
    let text = status.charAt(0).toUpperCase() + status.slice(1)
    
    if (status === 'invited') {
      text = 'Invited for Interview'
    }
    
    return <Tag color={color}>{text}</Tag>
  }

  const handleDownloadResume = async (applicationId: number) => {
    try {
      await downloadResumeFile(applicationId)
    } catch (error) {
      message.error('Failed to download resume file')
      console.error(error)
    }
  }
  
  return (
    <div className="p-6">
      <Title level={2}>My Applications</Title>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : applications.length === 0 ? (
        <Empty description="You haven't applied to any jobs yet" />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="w-full">
              <div className="flex justify-between items-start">
                <div>
                  <Title level={4}>{application.job_title}</Title>
                  <Text strong>{application.company}</Text>
                  {application.location && (
                    <Text type="secondary" className="ml-2">
                      {application.location}
                    </Text>
                  )}
                </div>
                <div>
                  {renderStatusTag(application.status)}
                </div>
              </div>
              <div className="mt-4">
                <Text type="secondary">
                  Applied on: {new Date(application.applied_at || '').toLocaleDateString()}
                </Text>
                {application.updated_at && application.updated_at !== application.applied_at && (
                  <Text type="secondary" className="ml-4">
                    Last updated: {new Date(application.updated_at).toLocaleDateString()}
                  </Text>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyApplicationsPage