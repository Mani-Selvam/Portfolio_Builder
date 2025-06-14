import { Button } from "@/components/ui/button";
import { Rocket, Shield } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="text-center mb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Build Your Professional Portfolio</h1>
        <p className="text-xl text-gray-600 mb-8">
          Submit your details and let us create a stunning portfolio website tailored just for you. 
          No technical skills required!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = "/submit"} 
            className="btn-primary text-lg px-8 py-3"
          >
            <Rocket className="mr-2" />
            Get Started
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/admin/login"}
            className="text-lg px-8 py-3"
          >
            <Shield className="mr-2" />
            Admin Access
          </Button>
        </div>
      </div>
    </div>
  );
}
