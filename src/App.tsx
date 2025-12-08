import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StudentProvider, useStudentContext } from "./contexts/StudentContext";
import { AppLayout } from "./components/layout/AppLayout";
import { UpdatePrompt } from "./components/pwa/UpdatePrompt";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import ChapterDetail from "./pages/ChapterDetail";
import TopicLearn from "./pages/TopicLearn";
import Tutor from "./pages/Tutor";
import Practice from "./pages/Practice";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { loading, isOnboarded } = useStudentContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      
      {!isOnboarded ? (
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      ) : (
        <>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:subjectId/:chapterId" element={<ChapterDetail />} />
            <Route path="/learn/topic/:topicId" element={<TopicLearn />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UpdatePrompt />
      <BrowserRouter>
        <StudentProvider>
          <AppRoutes />
          <InstallPrompt />
        </StudentProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
