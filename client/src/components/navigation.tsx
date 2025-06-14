import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
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
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = "/submit"}
              className="nav-btn text-gray-700 hover:text-primary"
            >
              Submit Portfolio
            </Button>
            <Button 
              onClick={() => window.location.href = "/admin/login"}
              className="btn-primary"
            >
              Admin Login
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
