import React, { useState, useEffect } from 'react';
import { getJobs, applyForJob, Job } from '@/lib/api';
import { Button, Card, Input, Select, Space, Typography, message, Modal, Form, Spin, Upload } from 'antd';
import { SearchOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SearchJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchJobType, setSearchJobType] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [form] = Form.useForm();
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const filters: { title?: string; location?: string; job_type?: string } = {};
      if (searchTitle) filters.title = searchTitle;
      if (searchLocation) filters.location = searchLocation;
      if (searchJobType) filters.job_type = searchJobType;

      const jobsData = await getJobs(filters);
      setJobs(jobsData);
    } catch (error) {
      message.error('Failed to fetch jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = () => {
    fetchJobs();
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setApplyModalVisible(true);
  };

  const handleFileChange = (info: any) => {
    if (info.file) {
      setResumeFile(info.file);
    }
  };

  const handleApplySubmit = async () => {
    if (!selectedJob) return;

    try {
      setApplying(true);
      const values = await form.validateFields();
      await applyForJob(selectedJob.id as number, values.coverLetter, resumeFile || undefined);
      message.success('Application submitted successfully!');
      setApplyModalVisible(false);
      form.resetFields();
      setResumeFile(null);
    } catch (error: any) {
      console.error('Application error:', error); // Log the entire error object

      // Check for axios error response
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);

        if (error.response.status === 404) {
          message.error('Job listing not found. It may have been removed.');
        } else if (error.response.status === 400) {
          // Make sure we're displaying any 400 error message that comes back
          const errorMsg = error.response.data?.error || 'Bad request';
          if (errorMsg === 'You have already applied for this job') {
            message.warning('You have already applied for this job.');
            alert('You have already applied for this job.'); // Show alert to the user
          } else {
            message.error(`Application failed: ${errorMsg}`);
          }
        } else if (error.response.status === 403) {
          message.error('You are not authorized to apply for this job.');
        } else {
          message.error(`Application failed: ${error.response.data?.error || 'Unknown error'}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        message.error('No response received from the server. Please try again later.');
      } else if (error.message) {
        // Something else happened in setting up the request
        message.error(`Failed to apply: ${error.message}`);
      } else {
        // Fallback error message
        message.error('Failed to apply for job');
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="p-6">
      <Title level={2}>Search Jobs</Title>

      <div className="bg-white p-4 rounded shadow mb-6">
        <Space direction="vertical" size="middle" className="w-full">
          <Space wrap>
            <Input
              placeholder="Job Title"
              value={searchTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTitle(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Input
              placeholder="Location"
              value={searchLocation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchLocation(e.target.value)}
              style={{ width: 200 }}
            />
            <Select<string>
              placeholder="Job Type"
              value={searchJobType}
              onChange={(value: string) => setSearchJobType(value)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="Full-time">Full-time</Option>
              <Option value="Part-time">Part-time</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Internship">Internship</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
          </Space>
        </Space>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="job-grid">
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Text>No jobs found matching your criteria.</Text>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="job-card">
              <div className="job-card-inner">
                <div className="job-card-front">
                  <Title level={4}>{job.title}</Title>
                  <Text strong>{job.company}</Text>
                  <div className="mt-1">
                    <Text type="secondary">{job.location}</Text>
                    {job.job_type && (
                      <Text type="secondary" className="ml-4">
                        {job.job_type}
                      </Text>
                    )}
                    {job.salary && (
                      <Text type="secondary" className="ml-4 job-card-salary">
                        {job.salary}
                      </Text>
                    )}
                  </div>
                  {/* Removed Apply button from front */}
                </div>
                <div className="job-card-back">
                  <Paragraph className="job-card-description" ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
                    {job.description}
                  </Paragraph>
                  {job.requirements && (
                    <div className="mt-2">
                      <Text strong>Requirements:</Text>
                      <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                        {job.requirements}
                      </Paragraph>
                    </div>
                  )}
                  <Text type="secondary" className="text-xs">
                    Posted: {new Date(job.created_at || '').toLocaleDateString()}
                  </Text>
                  <Button type="primary" onClick={() => handleApply(job)} className="apply-button">
                    Apply
                  </Button>
                </div>
              </div>
            </div>
            
            ))
          )}
        </div>
      )}

      <Modal
        title="Apply for Job"
        open={applyModalVisible}
        onCancel={() => setApplyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setApplyModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={applying} onClick={handleApplySubmit}>
            Submit Application
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" name="applyForm">
          <Form.Item
            label="Cover Letter"
            name="coverLetter"
            rules={[{ required: true, message: 'Please enter your cover letter!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Resume">
            <Upload
              beforeUpload={() => false} // Prevent automatic upload
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />}>Upload Resume</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SearchJobsPage;