import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Router from "./routes/approutes";
import AuthProvider from "./context/AuthContext";

function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <Toaster position="top-center" expand={true} richColors={true} />
      <HelmetProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={Router()} />
          </QueryClientProvider>
        </AuthProvider>
      </HelmetProvider>
    </>
  );
}

export default App;
