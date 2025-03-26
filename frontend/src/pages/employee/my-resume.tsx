import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { getResume, createResume, updateResume, downloadResumeAsPdf, Resume } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Download, FileText, Plus, Save, Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MyResumePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("contact");
  const [resumeExists, setResumeExists] = useState(false);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default resume structure
  const [resumeData, setResumeData] = useState<Omit<Resume, 'id' | 'employee_id'>>({
    contact: {
      name: "",
      email: "",
      phone: "",
      website: "",
      linkedin: "",
      github: ""
    },
    skills: [""],
    experiences: [{
      company: "",
      position: "",
      date: "",
      description: [""]
    }],
    certifications: [""],
    projects: [{
      name: "",
      url: "",
      date: "",
      description: [""]
    }],
    education: [{
      institution: "",
      degree: "",
      date: ""
    }],
    pdf_resume: ""
  });

  // Fetch existing resume data on component mount
  useEffect(() => {
    async function fetchResume() {
      if (!user?.id) return;
      
      try {
        setError(null);
        const data = await getResume(user.id);
        
        if (data) {
          setResumeData(data);
          setResumeId(data.id);
          setResumeExists(true);
        }
      } catch (err: any) {
        console.error("Error fetching resume:", err);
        setError(err.message || "Failed to load resume data");
      }
    }
    
    fetchResume();
  }, [user]);

  // Handle saving resume
  const handleSaveResume = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      setError(null);
      
      if (resumeExists && resumeId) {
        // Update existing resume
        await updateResume(resumeId, resumeData);
        toast({
          title: "Resume Updated",
          description: "Your resume has been updated successfully"
        });
      } else {
        // Create new resume
        const response = await createResume({
          employee_id: Number(user.id),
          ...resumeData
        });
        setResumeId(response.id);
        setResumeExists(true);
        toast({
          title: "Resume Created",
          description: "Your resume has been created successfully"
        });
      }
    } catch (err: any) {
      console.error("Error saving resume:", err);
      setError(err.message || "Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  // Handle download resume
  const handleDownloadResume = async () => {
    if (!resumeId) {
      toast({
        title: "No Resume Found",
        description: "Please create a resume first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await downloadResumeAsPdf(resumeId);
      toast({
        title: "Resume Downloaded",
        description: "Your resume PDF has been downloaded"
      });
    } catch (err: any) {
      console.error("Error downloading resume:", err);
      toast({
        title: "Download Failed",
        description: err.message || "Failed to download resume",
        variant: "destructive"
      });
    }
  };

  // Various handlers for form updates
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [name]: value
      }
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...resumeData.skills];
    newSkills[index] = value;
    setResumeData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, ""]
    }));
  };

  const removeSkill = (index: number) => {
    if (resumeData.skills.length <= 1) return;
    
    const newSkills = [...resumeData.skills];
    newSkills.splice(index, 1);
    setResumeData(prev => ({ ...prev, skills: newSkills }));
  };

  // Experience handlers
  const handleExperienceChange = (index: number, field: keyof typeof resumeData.experiences[0], value: string) => {
    const newExperiences = [...resumeData.experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setResumeData(prev => ({ ...prev, experiences: newExperiences }));
  };

  const handleExperienceDescriptionChange = (expIndex: number, descIndex: number, value: string) => {
    const newExperiences = [...resumeData.experiences];
    const newDescriptions = [...newExperiences[expIndex].description];
    newDescriptions[descIndex] = value;
    newExperiences[expIndex] = { ...newExperiences[expIndex], description: newDescriptions };
    setResumeData(prev => ({ ...prev, experiences: newExperiences }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { company: "", position: "", date: "", description: [""] }]
    }));
  };

  const removeExperience = (index: number) => {
    if (resumeData.experiences.length <= 1) return;
    
    const newExperiences = [...resumeData.experiences];
    newExperiences.splice(index, 1);
    setResumeData(prev => ({ ...prev, experiences: newExperiences }));
  };

  const addExperienceDescriptionPoint = (expIndex: number) => {
    const newExperiences = [...resumeData.experiences];
    newExperiences[expIndex].description.push("");
    setResumeData(prev => ({ ...prev, experiences: newExperiences }));
  };

  const removeExperienceDescriptionPoint = (expIndex: number, descIndex: number) => {
    if (resumeData.experiences[expIndex].description.length <= 1) return;
    
    const newExperiences = [...resumeData.experiences];
    newExperiences[expIndex].description.splice(descIndex, 1);
    setResumeData(prev => ({ ...prev, experiences: newExperiences }));
  };

  // Education handlers
  const handleEducationChange = (index: number, field: keyof typeof resumeData.education[0], value: string) => {
    const newEducation = [...resumeData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setResumeData(prev => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", date: "" }]
    }));
  };

  const removeEducation = (index: number) => {
    if (resumeData.education.length <= 1) return;
    
    const newEducation = [...resumeData.education];
    newEducation.splice(index, 1);
    setResumeData(prev => ({ ...prev, education: newEducation }));
  };

  // Project handlers
  const handleProjectChange = (index: number, field: keyof Omit<typeof resumeData.projects[0], 'description'>, value: string) => {
    const newProjects = [...resumeData.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setResumeData(prev => ({ ...prev, projects: newProjects }));
  };

  const handleProjectDescriptionChange = (projIndex: number, descIndex: number, value: string) => {
    const newProjects = [...resumeData.projects];
    const newDescriptions = [...newProjects[projIndex].description];
    newDescriptions[descIndex] = value;
    newProjects[projIndex] = { ...newProjects[projIndex], description: newDescriptions };
    setResumeData(prev => ({ ...prev, projects: newProjects }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: "", url: "", date: "", description: [""] }]
    }));
  };

  const removeProject = (index: number) => {
    if (resumeData.projects.length <= 1) return;
    
    const newProjects = [...resumeData.projects];
    newProjects.splice(index, 1);
    setResumeData(prev => ({ ...prev, projects: newProjects }));
  };

  const addProjectDescriptionPoint = (projIndex: number) => {
    const newProjects = [...resumeData.projects];
    newProjects[projIndex].description.push("");
    setResumeData(prev => ({ ...prev, projects: newProjects }));
  };

  const removeProjectDescriptionPoint = (projIndex: number, descIndex: number) => {
    if (resumeData.projects[projIndex].description.length <= 1) return;
    
    const newProjects = [...resumeData.projects];
    newProjects[projIndex].description.splice(descIndex, 1);
    setResumeData(prev => ({ ...prev, projects: newProjects }));
  };

  // Certification handlers
  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...resumeData.certifications];
    newCertifications[index] = value;
    setResumeData(prev => ({ ...prev, certifications: newCertifications }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, ""]
    }));
  };

  const removeCertification = (index: number) => {
    if (resumeData.certifications.length <= 1) return;
    
    const newCertifications = [...resumeData.certifications];
    newCertifications.splice(index, 1);
    setResumeData(prev => ({ ...prev, certifications: newCertifications }));
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resume</h1>
          <p className="text-muted-foreground mt-1">Build and manage your professional profile</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadResume} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={handleSaveResume} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> {resumeExists ? "Update Resume" : "Create Resume"}
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        {/* Contact Information Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Add your personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={resumeData.contact.name}
                    onChange={handleContactChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={resumeData.contact.email}
                    onChange={handleContactChange}
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={resumeData.contact.phone}
                    onChange={handleContactChange}
                    placeholder="+1 (123) 456-7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    name="website"
                    value={resumeData.contact.website}
                    onChange={handleContactChange}
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={resumeData.contact.linkedin}
                    onChange={handleContactChange}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub (Optional)</Label>
                  <Input
                    id="github"
                    name="github"
                    value={resumeData.contact.github}
                    onChange={handleContactChange}
                    placeholder="https://github.com/johndoe"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your educational background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.education.map((edu, eduIndex) => (
                <div key={eduIndex} className="p-4 border rounded-md space-y-4 relative">
                  <button 
                    onClick={() => removeEducation(eduIndex)} 
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(eduIndex, 'institution', e.target.value)}
                        placeholder="University name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(eduIndex, 'degree', e.target.value)}
                        placeholder="BS in Computer Science"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      value={edu.date}
                      onChange={(e) => handleEducationChange(eduIndex, 'date', e.target.value)}
                      placeholder="2018 - 2022"
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addEducation} type="button" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Education
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Add your professional work experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.experiences.map((exp, expIndex) => (
                <div key={expIndex} className="p-4 border rounded-md space-y-4 relative">
                  <button 
                    onClick={() => removeExperience(expIndex)} 
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(expIndex, 'company', e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => handleExperienceChange(expIndex, 'position', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        value={exp.date}
                        onChange={(e) => handleExperienceChange(expIndex, 'date', e.target.value)}
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="mb-2 block">Description</Label>
                    {exp.description.map((desc, descIndex) => (
                      <div key={descIndex} className="flex gap-2 mb-2">
                        <Input
                          value={desc}
                          onChange={(e) => handleExperienceDescriptionChange(expIndex, descIndex, e.target.value)}
                          placeholder="Describe your responsibilities and achievements"
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeExperienceDescriptionPoint(expIndex, descIndex)}
                          type="button"
                          disabled={exp.description.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addExperienceDescriptionPoint(expIndex)}
                      type="button"
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Point
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addExperience} type="button" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Experience
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add your technical and soft skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="Enter a skill (e.g., JavaScript, React, Project Management)"
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeSkill(index)}
                    type="button"
                    disabled={resumeData.skills.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addSkill} type="button" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Skill
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Add your projects and portfolio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {resumeData.projects.map((project, projectIndex) => (
                <div key={projectIndex} className="p-4 border rounded-md space-y-4 relative">
                  <button 
                    onClick={() => removeProject(projectIndex)} 
                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input
                      value={project.name}
                      onChange={(e) => handleProjectChange(projectIndex, 'name', e.target.value)}
                      placeholder="Project name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project URL (Optional)</Label>
                      <Input
                        value={project.url}
                        onChange={(e) => handleProjectChange(projectIndex, 'url', e.target.value)}
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date (Optional)</Label>
                      <Input
                        value={project.date}
                        onChange={(e) => handleProjectChange(projectIndex, 'date', e.target.value)}
                        placeholder="2022"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="mb-2 block">Description</Label>
                    {project.description.map((desc, descIndex) => (
                      <div key={descIndex} className="flex gap-2 mb-2">
                        <Input
                          value={desc}
                          onChange={(e) => handleProjectDescriptionChange(projectIndex, descIndex, e.target.value)}
                          placeholder="Describe the project and your contributions"
                          className="flex-1"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeProjectDescriptionPoint(projectIndex, descIndex)}
                          type="button"
                          disabled={project.description.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addProjectDescriptionPoint(projectIndex)}
                      type="button"
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Point
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addProject} type="button" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Project
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
              <CardDescription>Add your certifications and credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.certifications.map((cert, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={cert}
                    onChange={(e) => handleCertificationChange(index, e.target.value)}
                    placeholder="e.g., AWS Certified Developer, Google Analytics Certification"
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeCertification(index)}
                    type="button"
                    disabled={resumeData.certifications.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addCertification} type="button" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Certification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button onClick={handleSaveResume} size="lg" disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> {resumeExists ? "Update Resume" : "Create Resume"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}