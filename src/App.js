import Router from "./shared/Router";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-[100vw] h-[100vh] bg-[#1B1B1B]">
        <div className="flex flex-col items-center w-full h-full mx-auto">
          <Router />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
