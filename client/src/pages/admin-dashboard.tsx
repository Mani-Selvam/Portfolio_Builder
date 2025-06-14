import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SubmissionCard from "@/components/submission-card";
import SubmissionDetails from "@/pages/submission-details";
import { 
  Gauge, 
  Users, 
  Clock, 
  CheckCircle, 
  Globe, 
  Search, 
  Download, 
  LogOut,
  ChevronLeft,
  ChevronRight 
} from "lucide-react";
import type { SubmissionWithProjects } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAdmin, isLoading } = useAdmin();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access the admin dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 500);
      return;
    }
  }, [isAdmin, isLoading, toast]);

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery<SubmissionWithProjects[]>({
    queryKey: ["/api/admin/submissions"],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, completed }: { id: number; status: string; completed?: boolean }) => {
      const response = await fetch(`/api/admin/submissions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, completed }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/submissions"] });
      toast({
        title: "Success",
        description: "Submission status updated successfully",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/status"] });
      window.location.href = "/";
    } catch (error) {
      window.location.href = "/";
    }
  };

  const handleDownloadResume = (filename: string) => {
    const url = filename.replace('/api/uploads/', '');
    window.open(`/api/admin/download/${url}`, '_blank');
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchTerm === "" || 
      submission.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.professionalTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "" || statusFilter === "all" || submission.status === statusFilter;
    
    // Date filtering logic can be implemented here
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    completed: submissions.filter(s => s.completed).length,
    inProgress: submissions.filter(s => s.status === "in-progress").length,
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

  // Show submission details if one is selected
  if (selectedSubmissionId) {
    return (
      <SubmissionDetails
        submissionId={selectedSubmissionId}
        onBack={() => setSelectedSubmissionId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="text-2xl mr-3">📁</div>
                <span className="text-xl font-bold text-gray-900">PortfolioBuilder</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Gauge className="mr-3 text-secondary" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage client submissions and portfolio requests</p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <Button 
                className="btn-accent"
                onClick={() => {
                  const exportData = {
                    submissions: filteredSubmissions,
                    exportedAt: new Date().toISOString(),
                    totalSubmissions: stats.total,
                    stats,
                  };
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `portfolio_submissions_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast({
                    title: "Success",
                    description: "Data exported successfully",
                  });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-primary text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-accent text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Globe className="text-secondary text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Submissions */}
        <div className="grid gap-6">
          {submissionsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No submissions found.</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                onStatusUpdate={(status, completed) => 
                  updateStatusMutation.mutate({ id: submission.id, status, completed })
                }
                onDownloadResume={() => handleDownloadResume(submission.resumeUrl)}
                onViewDetails={() => setSelectedSubmissionId(submission.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredSubmissions.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing 1 to {filteredSubmissions.length} of {filteredSubmissions.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
