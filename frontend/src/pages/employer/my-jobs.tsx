import React, { useState, useEffect } from 'react'
import { getEmployerJobs, deleteJob, updateJob, getJobApplications, updateApplicationStatus, Job, JobApplication } from '@/lib/api'
import { Table, Button, Typography, Tag, Space, Modal, message, Spin, Tabs, Form, Input, Select } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

const statusColors = {
  active: 'green',
  inactive: 'red',
  pending: 'gold',
  invited: 'green',
  rejected: 'red'
}

const MyJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [applicationsModalVisible, setApplicationsModalVisible] = useState(false)
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [updateStatusLoading, setUpdateStatusLoading] = useState<number | null>(null)
  const [form] = Form.useForm()

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const jobsData = await getEmployerJobs()
      setJobs(jobsData)
    } catch (error) {
      message.error('Failed to fetch jobs')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const showEditModal = (job: Job) => {
    setSelectedJob(job)
    form.setFieldsValue({
      title: job.title,
      company: job.company,
      location: job.location || '',
      job_type: job.job_type || 'Full-time',
      salary: job.salary || '',
      description: job.description,
      requirements: job.requirements || '',
      is_active: job.is_active !== false
    })
    setEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedJob) return
    
    try {
      const values = await form.validateFields()
      await updateJob(selectedJob.id as number, values)
      message.success('Job updated successfully!')
      setEditModalVisible(false)
      fetchJobs()
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to update job: ${error.message}`)
      } else {
        message.error('Failed to update job')
      }
      console.error(error)
    }
  }

  const showDeleteConfirm = (job: Job) => {
    setSelectedJob(job)
    setConfirmDeleteVisible(true)
  }

  const handleDelete = async () => {
    if (!selectedJob) return
    
    try {
      await deleteJob(selectedJob.id as number)
      message.success('Job deleted successfully!')
      setConfirmDeleteVisible(false)
      fetchJobs()
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to delete job: ${error.message}`)
      } else {
        message.error('Failed to delete job')
      }
      console.error(error)
    }
  }

  const showApplications = async (job: Job) => {
    setSelectedJob(job)
    setApplicationsModalVisible(true)
    
    try {
      setLoadingApplications(true)
      const applicationsData = await getJobApplications(job.id as number)
      setApplications(applicationsData)
    } catch (error) {
      message.error('Failed to fetch applications')
      console.error(error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleUpdateStatus = async (applicationId: number, status: 'pending' | 'invited' | 'rejected') => {
    try {
      setUpdateStatusLoading(applicationId)
      await updateApplicationStatus(applicationId, status)
      message.success('Application status updated!')
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ))
    } catch (error) {
      message.error('Failed to update application status')
      console.error(error)
    } finally {
      setUpdateStatusLoading(null)
    }
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Job) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary">{record.company}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Type',
      dataIndex: 'job_type',
      key: 'job_type',
    },
    {
      title: 'Applications',
      dataIndex: 'application_count',
      key: 'application_count',
      render: (count: number) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>{count}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? statusColors.active : statusColors.inactive}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Posted',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Job) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showApplications(record)}
            disabled={record.application_count === 0}
          >
            View Applications
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      )
    }
  ]

  const applicationColumns = [
    {
      title: 'Applicant',
      dataIndex: 'employee_name',
      key: 'employee_name',
      render: (text: string, record: JobApplication) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary">{record.employee_email}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Applied On',
      dataIndex: 'applied_at',
      key: 'applied_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
          {status === 'invited' ? 'Invited for Interview' : status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: JobApplication) => (
        <Space>
          <Button
            type="primary"
            loading={updateStatusLoading === record.id}
            disabled={record.status === 'invited' || updateStatusLoading !== null}
            onClick={() => handleUpdateStatus(record.id as number, 'invited')}
          >
            Invite to Interview
          </Button>
          <Button
            danger
            loading={updateStatusLoading === record.id}
            disabled={record.status === 'rejected' || updateStatusLoading !== null}
            onClick={() => handleUpdateStatus(record.id as number, 'rejected')}
          >
            Reject
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6">
      <Title level={2}>My Job Listings</Title>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Edit Job Modal */}
      <Modal
        title="Edit Job"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditSubmit}>
            Save Changes
          </Button>,
        ]}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Job Title"
            rules={[{ required: true, message: 'Please enter a job title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter your company name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>

          <Form.Item name="job_type" label="Job Type">
            <Select>
              <Option value="Full-time">Full-time</Option>
              <Option value="Part-time">Part-time</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Internship">Internship</Option>
              <Option value="Remote">Remote</Option>
            </Select>
          </Form.Item>

          <Form.Item name="salary" label="Salary Range">
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Job Description"
            rules={[{ required: true, message: 'Please enter a job description' }]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item name="requirements" label="Requirements">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="is_active" label="Status" valuePropName="checked">
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={confirmDeleteVisible}
        onCancel={() => setConfirmDeleteVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmDeleteVisible(false)}>
            Cancel
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleDelete}>
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this job posting?</p>
        {selectedJob && (
          <p>
            <Text strong>{selectedJob.title}</Text> at <Text strong>{selectedJob.company}</Text>
          </p>
        )}
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Applications Modal */}
      <Modal
        title={selectedJob ? `Applications for ${selectedJob.title}` : 'Job Applications'}
        open={applicationsModalVisible}
        onCancel={() => setApplicationsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setApplicationsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={1000}
      >
        {loadingApplications ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <Text>No applications have been submitted for this job yet.</Text>
          </div>
        ) : (
          <Tabs defaultActiveKey="all">
            <TabPane tab="All Applications" key="all">
              <Table
                dataSource={applications}
                columns={applicationColumns}
                rowKey="id"
                pagination={false}
                expandable={{
                  expandedRowRender: (record) => (
                    <div className="p-4">
                      <Title level={5}>Cover Letter</Title>
                      <Paragraph>
                        {record.cover_letter || 'No cover letter provided.'}
                      </Paragraph>
                    </div>
                  ),
                  rowExpandable: (record) => Boolean(record.cover_letter),
                }}
              />
            </TabPane>
            <TabPane tab="Pending" key="pending">
              <Table
                dataSource={applications.filter(app => app.status === 'pending')}
                columns={applicationColumns}
                rowKey="id"
                pagination={false}
                expandable={{
                  expandedRowRender: (record) => (
                    <div className="p-4">
                      <Title level={5}>Cover Letter</Title>
                      <Paragraph>
                        {record.cover_letter || 'No cover letter provided.'}
                      </Paragraph>
                    </div>
                  ),
                  rowExpandable: (record) => Boolean(record.cover_letter),
                }}
              />
            </TabPane>
            <TabPane tab="Invited" key="invited">
              <Table
                dataSource={applications.filter(app => app.status === 'invited')}
                columns={applicationColumns}
                rowKey="id"
                pagination={false}
                expandable={{
                  expandedRowRender: (record) => (
                    <div className="p-4">
                      <Title level={5}>Cover Letter</Title>
                      <Paragraph>
                        {record.cover_letter || 'No cover letter provided.'}
                      </Paragraph>
                    </div>
                  ),
                  rowExpandable: (record) => Boolean(record.cover_letter),
                }}
              />
            </TabPane>
            <TabPane tab="Rejected" key="rejected">
              <Table
                dataSource={applications.filter(app => app.status === 'rejected')}
                columns={applicationColumns}
                rowKey="id"
                pagination={false}
                expandable={{
                  expandedRowRender: (record) => (
                    <div className="p-4">
                      <Title level={5}>Cover Letter</Title>
                      <Paragraph>
                        {record.cover_letter || 'No cover letter provided.'}
                      </Paragraph>
                    </div>
                  ),
                  rowExpandable: (record) => Boolean(record.cover_letter),
                }}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  )
}

export default MyJobsPage