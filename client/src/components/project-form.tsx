import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/file-upload";
import { X } from "lucide-react";

interface Project {
  title: string;
  description: string;
  technologies: string;
  githubUrl: string;
  demoUrl: string;
}

interface ProjectFormProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onRemove: () => void;
  onScreenshotChange: (file: File | null) => void;
}

export default function ProjectForm({ project, onUpdate, onRemove, onScreenshotChange }: ProjectFormProps) {
  const handleChange = (field: keyof Project, value: string) => {
    onUpdate({ ...project, [field]: value });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Project Details</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
          <Input
            value={project.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="E-commerce Website"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
          <Input
            value={project.technologies}
            onChange={(e) => handleChange('technologies', e.target.value)}
            placeholder="React, Node.js, MongoDB"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
        <Textarea
          rows={3}
          value={project.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Brief description of the project..."
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Repository</label>
          <Input
            type="url"
            value={project.githubUrl}
            onChange={(e) => handleChange('githubUrl', e.target.value)}
            placeholder="https://github.com/username/repo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Live Demo Link</label>
          <Input
            type="url"
            value={project.demoUrl}
            onChange={(e) => handleChange('demoUrl', e.target.value)}
            placeholder="https://yourproject.com"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Screenshot</label>
        <FileUpload
          accept="image/*"
          onFileSelect={onScreenshotChange}
          label="Upload project screenshot"
          description="PNG, JPG up to 5MB"
          icon="🖼️"
        />
      </div>
    </div>
  );
}
