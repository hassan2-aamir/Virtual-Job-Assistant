import React, { useState } from 'react'
import { createJob } from '@/lib/api'
import { Form, Input, Button, Select, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

const AddJobsPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: any) => {
    try {
      setLoading(true)
      await createJob(values)
      message.success('Job posted successfully!')
      form.resetFields()
      navigate('/employer/my-jobs')
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to post job: ${error.message}`)
      } else {
        message.error('Failed to post job')
      }
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Title level={2}>Create Job Listing</Title>

      <div className="bg-white p-6 rounded shadow">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            job_type: 'Full-time',
            is_active: true
          }}
        >
          <Form.Item
            name="title"
            label="Job Title"
            rules={[{ required: true, message: 'Please enter a job title' }]}
          >
            <Input placeholder="e.g. Software Engineer" />
          </Form.Item>

          <Form.Item
            name="company"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter your company name' }]}
          >
            <Input placeholder="e.g. Tech Solutions Inc." />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="e.g. New York, NY" />
          </Form.Item>

          <Form.Item
            name="job_type"
            label="Job Type"
          >
            <Select>
              <Option value="Full-time">Full-time</Option>
              <Option value="Part-time">Part-time</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Internship">Internship</Option>
              <Option value="Remote">Remote</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="salary"
            label="Salary Range"
          >
            <Input placeholder="e.g. $80,000 - $100,000" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Job Description"
            rules={[{ required: true, message: 'Please enter a job description' }]}
          >
            <TextArea rows={6} placeholder="Describe the job role, responsibilities, and company..." />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="Requirements"
          >
            <TextArea rows={4} placeholder="List the skills, experience, and qualifications required..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Post Job
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default AddJobsPage