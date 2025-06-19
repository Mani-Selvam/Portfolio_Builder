import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  Mail, 
  Phone, 
  Calendar,
  User,
  GraduationCap,
  Briefcase,
  Code,
  Globe
} from "lucide-react";
import type { SubmissionWithProjects } from "@shared/schema";

interface SubmissionDetailsProps {
  submissionId: number;
  onBack: () => void;
}

export default function SubmissionDetails({ submissionId, onBack }: SubmissionDetailsProps) {
  const { toast } = useToast();
  const { isAdmin, isLoading } = useAdmin();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access submission details.",
        variant: "destructive",
      });
      onBack();
      return;
    }
  }, [isAdmin, isLoading, toast, onBack]);

  const { data: submission, isLoading: submissionLoading } = useQuery<SubmissionWithProjects>({
    queryKey: [`/api/admin/submissions/${submissionId}`],
    retry: false,
    enabled: isAdmin,
  });

  const handleDownload = (filename: string) => {
    const url = filename.replace('/api/uploads/', '');
    window.open(`/api/admin/download/${url}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (submissionLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-8">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submission details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-8">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Submission not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{submission.fullName}</h1>
              <p className="text-gray-600">{submission.professionalTitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(submission.status)}`}>
              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1).replace('-', ' ')}
            </Badge>
            <Button onClick={() => handleDownload(submission.resumeUrl)} className="btn-primary">
              <Download className="mr-2 h-4 w-4" />
              Download Resume
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-3 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="text-gray-400 h-4 w-4" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{submission.email}</p>
                    </div>
                  </div>
                  {submission.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="text-gray-400 h-4 w-4" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{submission.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Bio</p>
                  <p className="text-gray-900">{submission.bio}</p>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted on {formatDate(submission.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Education & Experience */}
            {(submission.degree || submission.company) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-3 text-primary" />
                    Education & Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {submission.degree && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <GraduationCap className="mr-2 h-4 w-4 text-gray-400" />
                          Education
                        </h4>
                        <div className="space-y-1">
                          <p className="font-medium">{submission.degree}</p>
                          {submission.university && <p className="text-gray-600">{submission.university}</p>}
                          {submission.graduationYear && <p className="text-sm text-gray-500">{submission.graduationYear}</p>}
                        </div>
                      </div>
                    )}
                    {submission.company && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Briefcase className="mr-2 h-4 w-4 text-gray-400" />
                          Work Experience
                        </h4>
                        <div className="space-y-1">
                          {submission.jobTitle && <p className="font-medium">{submission.jobTitle}</p>}
                          <p className="text-gray-600">{submission.company}</p>
                          {submission.duration && <p className="text-sm text-gray-500">{submission.duration}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            {submission.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-3 text-primary" />
                    Projects ({submission.projects.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {submission.projects.map((project, index) => (
                      <div key={project.id} className="border-l-4 border-primary pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg text-gray-900">{project.title}</h4>
                          <div className="flex space-x-2">
                            {project.githubUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (project.githubUrl) {
                                    window.open(project.githubUrl, '_blank');
                                  }
                                }}
                              >
                                <Code className="mr-2 h-3 w-3" />
                                GitHub
                              </Button>
                            )}
                            {project.demoUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (project.demoUrl) {
                                    window.open(project.demoUrl, '_blank');
                                  }
                                }}
                              >
                                <ExternalLink className="mr-2 h-3 w-3" />
                                Demo
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        {project.technologies && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies.split(',').map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.screenshotUrl && (
                          <div className="mt-3">
                            <img
                              src={project.screenshotUrl}
                              alt={`${project.title} screenshot`}
                              className="rounded-lg border border-gray-200 max-w-full h-auto"
                              style={{ maxHeight: '300px' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Photo */}
            {submission.profilePhotoUrl && (
              <Card>
                <CardContent className="p-6 text-center">
                  <img
                    src={submission.profilePhotoUrl}
                    alt={submission.fullName}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                  />
                  <h3 className="font-semibold text-gray-900">{submission.fullName}</h3>
                  <p className="text-gray-600">{submission.professionalTitle}</p>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {(submission.linkedinUrl || submission.githubUrl || submission.portfolioUrl || submission.otherSocialUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-3 text-primary" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {submission.linkedinUrl && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(submission.linkedinUrl!, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      LinkedIn
                    </Button>
                  )}
                  {submission.githubUrl && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(submission.githubUrl!, '_blank')}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  )}
                  {submission.portfolioUrl && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(submission.portfolioUrl!, '_blank')}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Portfolio
                    </Button>
                  )}
                  {submission.otherSocialUrl && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open(submission.otherSocialUrl!, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Other
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handleDownload(submission.resumeUrl)}
                  className="w-full btn-primary"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const data = {
                      submission,
                      exportedAt: new Date().toISOString(),
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${submission.fullName.replace(/\s+/g, '_')}_submission.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}