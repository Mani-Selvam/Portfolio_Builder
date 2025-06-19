import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Eye,
    Download,
    MoreVertical,
    ExternalLink,
    Code,
    Calendar,
    User,
    CheckCircle,
    Clock,
    AlertCircle,
} from "lucide-react";
import type { SubmissionWithProjects } from "@shared/schema";

interface SubmissionCardProps {
    submission: SubmissionWithProjects;
    onStatusUpdate: (status: string, completed?: boolean) => void;
    onDownloadResume: () => void;
    onViewDetails?: () => void;
}

export default function SubmissionCard({
    submission,
    onStatusUpdate,
    onDownloadResume,
    onViewDetails,
}: SubmissionCardProps) {
    const [showActions, setShowActions] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "in-progress":
                return "bg-blue-100 text-blue-800";
            case "pending":
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-3 w-3" />;
            case "in-progress":
                return <Clock className="h-3 w-3" />;
            case "pending":
            default:
                return <AlertCircle className="h-3 w-3" />;
        }
    };

    const formatDate = (dateInput: string | Date) => {
        const date =
            typeof dateInput === "string" ? new Date(dateInput) : dateInput;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="card-shadow overflow-hidden">
            <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                        {/* Profile photo placeholder */}
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            {submission.profilePhotoUrl ? (
                                <img
                                    src={submission.profilePhotoUrl}
                                    alt={submission.fullName}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <User className="text-gray-400 text-xl" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {submission.fullName}
                                </h3>
                                <Badge
                                    className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(
                                        submission.status
                                    )}`}>
                                    {getStatusIcon(submission.status)}
                                    {submission.status.charAt(0).toUpperCase() +
                                        submission.status
                                            .slice(1)
                                            .replace("-", " ")}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                                {submission.professionalTitle}
                            </p>
                            <p className="text-sm text-gray-500">
                                {submission.email}
                            </p>
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                                {submission.bio}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 lg:ml-4">
                        <Button
                            size="sm"
                            className="btn-primary"
                            onClick={onViewDetails}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDownloadResume}>
                            <Download className="mr-2 h-4 w-4" />
                            Resume
                        </Button>
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowActions(!showActions)}>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                            {showActions && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                                    <div className="p-2">
                                        <Select
                                            value={submission.status}
                                            onValueChange={(value) => {
                                                onStatusUpdate(
                                                    value,
                                                    value === "completed"
                                                );
                                                setShowActions(false);
                                            }}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="in-progress">
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    Completed
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Project Summary */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <Code className="mr-2 text-gray-400 h-4 w-4" />
                            <span>{submission.projects.length} Projects</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="mr-2 text-gray-400 h-4 w-4" />
                            <span>{formatDate(submission.createdAt)}</span>
                        </div>
                        {submission.projects.length > 0 && (
                            <div className="flex items-center">
                                <ExternalLink className="mr-2 text-gray-400 h-4 w-4" />
                                <span>
                                    {submission.projects
                                        .map((p) => p.technologies)
                                        .filter(Boolean)
                                        .join(", ")
                                        .substring(0, 50)}
                                    ...
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
