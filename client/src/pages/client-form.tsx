import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import FileUpload from "@/components/file-upload";
import ProjectForm from "@/components/project-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Plus,
    Rocket,
    User,
    Info,
    Code,
    GraduationCap,
    FileText,
} from "lucide-react";

const formSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    professionalTitle: z.string().min(2, "Professional title is required"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    degree: z.string().optional(),
    university: z.string().optional(),
    graduationYear: z.string().optional(),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    duration: z.string().optional(),
    linkedinUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    portfolioUrl: z.string().optional(),
    otherSocialUrl: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Project {
    title: string;
    description: string;
    technologies: string;
    githubUrl: string;
    demoUrl: string;
}

export default function ClientForm() {
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [resume, setResume] = useState<File | null>(null);
    const [projectScreenshots, setProjectScreenshots] = useState<
        (File | null)[]
    >([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            professionalTitle: "",
            bio: "",
            degree: "",
            university: "",
            graduationYear: "",
            company: "",
            jobTitle: "",
            duration: "",
            linkedinUrl: "",
            githubUrl: "",
            portfolioUrl: "",
            otherSocialUrl: "",
        },
    });

    const submitMutation = useMutation({
        mutationFn: async (data: FormData) => {
            if (!resume) {
                throw new Error("Resume is required");
            }

            const formData = new FormData();
            formData.append("data", JSON.stringify({ ...data, projects }));

            if (profilePhoto) {
                formData.append("profilePhoto", profilePhoto);
            }

            formData.append("resume", resume);

            projectScreenshots.forEach((screenshot, index) => {
                if (screenshot) {
                    formData.append("projectScreenshots", screenshot);
                }
            });

            const baseURL = import.meta.env.VITE_API_BASE_URL || "";
            const response = await fetch(`${baseURL}/api/submissions`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Submission failed");
            }

            return response.json();
        },
        onSuccess: () => {
            setShowSuccess(true);
            toast({
                title: "Success!",
                description: "Your portfolio submission has been received.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to submit portfolio",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: FormData) => {
        submitMutation.mutate(data);
    };

    const addProject = () => {
        setProjects([
            ...projects,
            {
                title: "",
                description: "",
                technologies: "",
                githubUrl: "",
                demoUrl: "",
            },
        ]);
        setProjectScreenshots([...projectScreenshots, null]);
    };

    const updateProject = (index: number, project: Project) => {
        const updatedProjects = [...projects];
        updatedProjects[index] = project;
        setProjects(updatedProjects);
    };

    const removeProject = (index: number) => {
        setProjects(projects.filter((_, i) => i !== index));
        setProjectScreenshots(projectScreenshots.filter((_, i) => i !== index));
    };

    const updateProjectScreenshot = (index: number, file: File | null) => {
        const updatedScreenshots = [...projectScreenshots];
        updatedScreenshots[index] = file;
        setProjectScreenshots(updatedScreenshots);
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-md mx-auto px-4 pt-20">
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-accent to-emerald-600 px-6 py-8 text-white text-center">
                            <div className="text-5xl mb-4">✓</div>
                            <h3 className="text-2xl font-bold mb-2">
                                Submission Successful!
                            </h3>
                            <p className="text-emerald-100">
                                Your portfolio details have been received
                            </p>
                        </div>
                        <CardContent className="p-6 text-center">
                            <p className="text-gray-600 mb-6">
                                We'll review your submission and start building
                                your custom portfolio website. You'll receive an
                                email confirmation shortly.
                            </p>
                            <Button
                                onClick={() => (window.location.href = "/")}
                                className="btn-primary">
                                Back to Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-secondary px-6 py-8 text-white">
                        <h2 className="text-3xl font-bold mb-2 flex items-center">
                            <Rocket className="mr-3" />
                            Create Your Portfolio
                        </h2>
                        <p className="text-blue-100">
                            Fill in your details below and we'll build a
                            stunning portfolio website just for you!
                        </p>
                    </div>

                    <CardContent className="p-6">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-8">
                                {/* Personal Details */}
                                <div className="space-y-6">
                                    <div className="flex items-center mb-4">
                                        <User className="text-primary text-xl mr-3" />
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Personal Details
                                        </h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Full Name *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="John Doe"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Email Address *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="john@example.com"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Phone Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="tel"
                                                            placeholder="+1 (555) 123-4567"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Profile Photo
                                            </label>
                                            <FileUpload
                                                accept="image/*"
                                                onFileSelect={setProfilePhoto}
                                                label="Upload profile photo"
                                                description="PNG, JPG up to 5MB"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="border-t border-gray-200 pt-8 space-y-6">
                                    <div className="flex items-center mb-4">
                                        <Info className="text-primary text-xl mr-3" />
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            About You
                                        </h3>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="professionalTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Professional Title *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Full-Stack Developer, UX Designer"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Short Bio *
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={4}
                                                        placeholder="Tell us about yourself and what you do in 2-4 lines..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Projects Section */}
                                <div className="border-t border-gray-200 pt-8 space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <Code className="text-primary text-xl mr-3" />
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                Projects
                                            </h3>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addProject}
                                            className="btn-primary">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Project
                                        </Button>
                                    </div>

                                    {projects.map((project, index) => (
                                        <ProjectForm
                                            key={index}
                                            project={project}
                                            onUpdate={(updatedProject) =>
                                                updateProject(
                                                    index,
                                                    updatedProject
                                                )
                                            }
                                            onRemove={() =>
                                                removeProject(index)
                                            }
                                            onScreenshotChange={(file) =>
                                                updateProjectScreenshot(
                                                    index,
                                                    file
                                                )
                                            }
                                        />
                                    ))}
                                </div>

                                {/* Education & Experience */}
                                <div className="border-t border-gray-200 pt-8 space-y-6">
                                    <div className="flex items-center mb-4">
                                        <GraduationCap className="text-primary text-xl mr-3" />
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Education & Experience
                                        </h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-900">
                                                Education (Optional)
                                            </h4>
                                            <FormField
                                                control={form.control}
                                                name="degree"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Degree
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., B.Tech Computer Science"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="university"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            University/College
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="University Name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="graduationYear"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Year of Completion
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="2023"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-900">
                                                Work Experience (Optional)
                                            </h4>
                                            <FormField
                                                control={form.control}
                                                name="company"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Company Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Company Name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="jobTitle"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Job Title
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Software Developer"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="duration"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Duration
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Jan 2022 - Present"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Resume & Social Links */}
                                <div className="border-t border-gray-200 pt-8 space-y-6">
                                    <div className="flex items-center mb-4">
                                        <FileText className="text-primary text-xl mr-3" />
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Resume & Social Links
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Resume *
                                        </label>
                                        <FileUpload
                                            accept=".pdf,application/pdf"
                                            onFileSelect={setResume}
                                            label="Click to upload your resume"
                                            description="PDF format preferred, max 10MB"
                                            icon="📄"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="linkedinUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        LinkedIn Profile
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://linkedin.com/in/username"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="githubUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        GitHub Profile
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://github.com/username"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="portfolioUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Portfolio URL
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="https://yourportfolio.com"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="otherSocialUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Other Social Media
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Twitter, Instagram, Behance, etc."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="border-t border-gray-200 pt-8">
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                (window.location.href = "/")
                                            }>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitMutation.isPending}
                                            className="btn-primary">
                                            {submitMutation.isPending
                                                ? "Submitting..."
                                                : "Submit Portfolio Details"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
