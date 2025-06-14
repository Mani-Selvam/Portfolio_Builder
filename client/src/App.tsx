import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAdmin } from "@/hooks/useAdmin";
import Landing from "@/pages/landing";
import ClientForm from "@/pages/client-form";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAdmin, isLoading } = useAdmin();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/submit" component={ClientForm} />
      <Route path="/admin/login" component={AdminLogin} />
      {isLoading ? (
        <Route path="/admin" component={() => (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        )} />
      ) : isAdmin ? (
        <Route path="/admin" component={AdminDashboard} />
      ) : (
        <Route path="/admin" component={AdminLogin} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
