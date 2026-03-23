import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, updateTaskStatus, createTask } from "../services/taskService";
import { useMemo, useState, cloneElement } from "react";
import { 
  ArrowLeft, CheckCircle2, Clock, AlertCircle, 
  Plus, Search, Filter, Calendar, Tag, 
  FileText, Briefcase, ChevronRight
} from "lucide-react";

const normalizeStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();
  return status === "completed" ? "Completed" : "Pending";
};

const getTaskId = (task) => task?._id || task?.id || "";

function Tasks() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", clientId],
    queryFn: () => getTasks(clientId),
  });

  const mutation = useMutation({
    mutationFn: updateTaskStatus,
    onMutate: async ({ id, status }) => {
      setUpdateError("");
      await queryClient.cancelQueries({ queryKey: ["tasks", clientId] });

      const previousTasks = queryClient.getQueryData(["tasks", clientId]) || [];

      queryClient.setQueryData(["tasks", clientId], (currentTasks = []) =>
        currentTasks.map((task) =>
          getTaskId(task) === id ? { ...task, status: normalizeStatus(status) } : task
        )
      );

      return { previousTasks };
    },
    onSuccess: (updatedTask) => {
      if (!updatedTask) return;

      const updatedId = getTaskId(updatedTask);
      queryClient.setQueryData(["tasks", clientId], (currentTasks = []) =>
        currentTasks.map((task) =>
          getTaskId(task) === updatedId
            ? { ...task, ...updatedTask, status: normalizeStatus(updatedTask.status) }
            : task
        )
      );
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", clientId], context.previousTasks);
      }

      setUpdateError("Could not update task status. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", clientId] });
    },
  });

  const [form, setForm] = useState({ title: "", description: "", category: "", due_date: "" });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", clientId] });
      setForm({ title: "", description: "", category: "", due_date: "" });
    },
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updateError, setUpdateError] = useState("");

  const onToggleStatus = (task) => {
    const id = getTaskId(task);
    if (!id) {
      setUpdateError("Task ID is missing, so status cannot be updated.");
      return;
    }

    const nextStatus = normalizeStatus(task.status) === "Pending" ? "Completed" : "Pending";
    mutation.mutate({ id, status: nextStatus });
  };

  const isOverdue = (task) =>
    normalizeStatus(task.status) === "Pending" && task.due_date && new Date(task.due_date) < new Date();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => normalizeStatus(t.status) === "Completed").length;
    // FIXED: Corrected ternary logic to avoid syntax errors
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      pending: tasks.filter((t) => normalizeStatus(t.status) === "Pending").length,
      overdue: tasks.filter((t) => isOverdue(t)).length,
      rate,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === "" || normalizeStatus(task.status) === statusFilter;
      const matchesSearch = `${task.title} ${task.description || ""}`.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, search]);

  if (isLoading) return <div className="p-10 text-white bg-[#0d1117] min-h-screen">Loading Ledger...</div>;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-[#2172d8]/30">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* TOP NAVIGATION */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors tracking-widest"
          >
            <ArrowLeft size={12} /> BACK TO PORTFOLIO
          </button>
        </div>

        {/* HEADER SECTION */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1 h-4 bg-[#2172d8]" />
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Compliance Pipeline</p>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Workflow Console</h1>
          <p className="text-gray-400 text-sm max-w-2xl">Monitor real-time obligations and due-date risks.</p>
        </header>

        {/* STAT CARDS - WHITE THEME */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total Tasks" value={`${stats.total}+12%`} sub="WoW Change" icon={<Briefcase size={16}/>} />
          <StatCard label="Overdue" value={stats.overdue} sub="High Risk" icon={<AlertCircle size={16}/>} isRisk={stats.overdue > 0} />
          <StatCard label="Completion" value={`${stats.rate}%`} sub="Documentation" icon={<CheckCircle2 size={16}/>} />
          
          {/* ACTIVE VIEW CARD (DARK) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 relative flex flex-col justify-between">
            <Search className="absolute right-4 top-4 text-gray-700" size={20} />
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active View</p>
              <p className="text-2xl font-bold">{filteredTasks.length} <span className="text-gray-600 text-lg">/ {stats.total}</span></p>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Filtered results</p>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              placeholder="Filter by name or category..." 
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#2172d8] transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] px-3 py-2 rounded-lg">
            <Filter size={14} className="text-[#2172d8]" />
            <select 
              className="bg-transparent text-xs font-bold outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="" className="bg-[#0d1117]">All Status</option>
              {/* Highlight style matching active selection */}
              <option value="Pending" className="bg-[#2172d8] text-white">Pending</option>
              <option value="Completed" className="bg-[#0d1117]">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* TASK LIST TABLE */}
          <div className="lg:col-span-8">
            {updateError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {updateError}
              </div>
            )}
            <div className="border border-[#30363d] rounded-xl overflow-hidden bg-[#161b22]/30">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#161b22] text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] border-b border-[#30363d]">
                  <tr>
                    <th className="px-6 py-4">Task Detail</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={getTaskId(task)} className="hover:bg-[#161b22]/80 transition-colors group">
                        <td className="px-6 py-4">
                          <p className={`font-bold text-sm ${normalizeStatus(task.status) === 'Completed' ? 'text-gray-600 line-through' : 'text-gray-100'}`}>
                            {task.title}
                          </p>
                          <span className="text-[10px] font-bold text-[#2172d8] uppercase bg-[#2172d8]/10 px-1.5 py-0.5 rounded">
                            {task.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-xs font-bold ${isOverdue(task) ? 'text-red-500' : 'text-gray-400'}`}>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'TBD'}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(() => {
                            const taskId = getTaskId(task);
                            const isUpdating = mutation.isPending && mutation.variables?.id === taskId;

                            return (
                          <button 
                            onClick={() => onToggleStatus(task)}
                            disabled={isUpdating}
                            className={`p-1.5 rounded-lg border transition-all ${
                              normalizeStatus(task.status) === 'Completed' 
                              ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                              : 'bg-white/5 border-white/10 text-gray-500 hover:border-[#2172d8] hover:text-[#2172d8]'
                            } ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {isUpdating ? (
                              <Clock size={16} className="animate-spin" />
                            ) : normalizeStatus(task.status) === 'Completed' ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-20 text-center text-gray-600 italic text-sm">
                        No active tasks found in the ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADD TASK SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xs font-bold mb-6 text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Plus size={14} className="text-[#2172d8]" /> Register Obligation
              </h3>
              <div className="space-y-4">
                <SidebarField label="Title" value={form.title} onChange={v => setForm({...form, title: v})} />
                <div className="grid grid-cols-2 gap-3">
                  <SidebarField label="Category" value={form.category} onChange={v => setForm({...form, category: v})} />
                  <SidebarField label="Due Date" type="date" value={form.due_date} onChange={v => setForm({...form, due_date: v})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">Notes</label>
                  <textarea 
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2172d8] min-h-[80px]"
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>
                <button 
                  onClick={() => createMutation.mutate({ ...form, client_id: clientId })}
                  className="w-full bg-[#2172d8] text-white font-bold py-3 rounded-xl hover:bg-[#1a5eb1] transition-all shadow-lg shadow-[#2172d8]/10 active:scale-95 mt-4"
                >
                  CREATE OBLIGATION
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, isRisk }) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 flex flex-col justify-between min-h-[110px] shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold  text-gray-200 uppercase tracking-tight">{label}</p>
        <span className={isRisk ? "text-red-500" : "text-[#2172d8]"}>{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-bold ${isRisk ? "text-red-600" : "text-gray-400"}`}>{value}</p>
        <p className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-tighter">{sub}</p>
      </div>
    </div>
  );
}

function SidebarField({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-600 uppercase ml-1">{label}</label>
      <input 
        type={type}
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#2172d8]"
        value={value} onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

export default Tasks;