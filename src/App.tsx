import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BackgroundMusicProvider } from "./contexts/BackgroundMusicContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoadingFallback from "./components/LoadingFallback";
import { useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";



const queryClient = new QueryClient();

const FallbackErrorComponent = ({ error, resetErrorBoundary }) => {
  return (
    <LoadingFallback 
      message={`Something went wrong: ${error.message}`} 
      isError={true} 
      onRetry={resetErrorBoundary} 
    />
  );
};

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Add a simple loading indicator with more timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    // Set a timeout to handle cases where the app doesn't load properly
    const errorTimer = setTimeout(() => {
      if (!isLoaded) {
        console.log("Application taking too long to load, setting error state");
        setHasError(true);
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(errorTimer);
    };
  }, [isLoaded]);

  return (
    <ErrorBoundary 
      FallbackComponent={FallbackErrorComponent}
      onReset={() => window.location.reload()}
    >
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <UserProvider>
            <BackgroundMusicProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                {!isLoaded ? (
                  <LoadingFallback message="Loading application..." />
                ) : hasError ? (
                  <LoadingFallback 
                    message="Application failed to load properly. Please try again." 
                    isError={true} 
                    onRetry={() => window.location.reload()} 
                  />
                ) : (
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                )}
              </TooltipProvider>
            </BackgroundMusicProvider>
          </UserProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
