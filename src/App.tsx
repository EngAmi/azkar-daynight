import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { FontScaleProvider } from "@/hooks/useFontScale";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import Index from "./pages/Index";
import AzkarSabah from "./pages/AzkarSabah";
import AzkarMassa from "./pages/AzkarMassa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <FontScaleProvider>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/azkar-sabah" element={<AzkarSabah />} />
                <Route path="/azkar-massa" element={<AzkarMassa />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </FontScaleProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
