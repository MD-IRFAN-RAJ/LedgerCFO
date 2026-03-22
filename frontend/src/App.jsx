import {
  BrowserRouter,
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Clients from "./pages/Clients";
import Tasks from "./pages/Tasks";
import "./App.css";

function LedgerLayout() {
  const location = useLocation();
  const isTasksView = location.pathname.startsWith("/tasks/");

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background elements moved to absolute positioning */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Operational Ledger</p>
            </div>
            <h1 className="text-xl font-black tracking-tight">LedgerCFO <span className="text-primary">Console</span></h1>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              Clients
            </NavLink>

            {isTasksView && (
              <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-all">
                ← Back
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LedgerLayout />}>
          <Route path="/" element={<Clients />} />
          <Route path="/tasks/:clientId" element={<Tasks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;