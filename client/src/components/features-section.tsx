import { UserCircle, ProjectorIcon, Smartphone } from "lucide-react";

export default function FeaturesSection() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-12">
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
          <UserCircle className="text-primary text-xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Branding</h3>
        <p className="text-gray-600">Showcase your unique professional identity with custom portfolio designs</p>
      </div>
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
          <ProjectorIcon className="text-secondary text-xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Gallery</h3>
        <p className="text-gray-600">Display your work with beautiful project showcases and live demos</p>
      </div>
      <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Smartphone className="text-accent text-xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Ready</h3>
        <p className="text-gray-600">Responsive designs that look perfect on all devices and screen sizes</p>
      </div>
    </div>
  );
}
