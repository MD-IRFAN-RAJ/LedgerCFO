import { cloneElement, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Filter,
  Globe,
  LayoutGrid,
  List,
  Search,
  Users,
  X,
} from "lucide-react";
import { createClient, getClients } from "../services/clientService";

const initialForm = {
  company_name: "",
  country: "",
  entity_type: "",
  govt_id: "",
  govt_id_type: "",
};

function Clients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [viewType, setViewType] = useState("grid");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setFormData(initialForm);
      setIsAddOpen(false);
    },
  });

  const countries = useMemo(() => {
    const values = clients
      .map((client) => client.country)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...new Set(values)];
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesCountry = countryFilter === "All" || client.country === countryFilter;
      const source = `${client.company_name} ${client.country} ${client.entity_type || ""} ${
        client.govt_id || ""
      }`.toLowerCase();
      return matchesCountry && source.includes(search.toLowerCase().trim());
    });
  }, [clients, countryFilter, search]);

  const summary = useMemo(() => {
    const totalGovtIds = clients.filter((c) => c.govt_id).length;
    return {
      totalClients: clients.length,
      countriesCovered: new Set(clients.map((i) => i.country)).size,
      completionRate: clients.length > 0 ? Math.round((totalGovtIds / clients.length) * 100) : 0,
      showing: filteredClients.length,
    };
  }, [clients, filteredClients.length]);

  const onFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitClient = (event) => {
    event.preventDefault();

    const payload = {
      company_name: formData.company_name.trim(),
      country: formData.country.trim(),
      entity_type: formData.entity_type.trim(),
      govt_id: formData.govt_id.trim() || undefined,
      govt_id_type: formData.govt_id_type.trim() || undefined,
    };

    createMutation.mutate(payload);
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Global Console
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground">Client Portfolio</h2>
            <p className="text-muted-foreground mt-1 text-lg">
              Monitoring compliance for <span className="text-foreground font-semibold">{summary.totalClients}</span>{" "}
              international entities.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            + Add New Client
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard title="Total Clients" value={summary.totalClients} trend="+12%" icon={<Users />} />
          <StatCard title="Global Reach" value={summary.countriesCovered} trend="+2" icon={<Globe />} />
          <StatCard title="Completion" value={`${summary.completionRate}%`} trend="+5%" icon={<CheckCircle2 />} />

          <div className="relative overflow-hidden bg-primary p-6 rounded-2xl text-primary-foreground shadow-xl flex flex-col justify-between">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Active Filter</span>
              <Search className="w-5 h-5 opacity-60" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold">{summary.showing}</div>
              <p className="text-xs opacity-80 mt-1 font-medium">Entities showing</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 p-2 bg-card/50 backdrop-blur-sm border border-border rounded-2xl shadow-sm">
          <div className="relative grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID or region..."
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-background border border-border rounded-xl">
              <Filter className="w-4 h-4 text-primary" />
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none cursor-pointer font-bold text-foreground appearance-none pr-4"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  backgroundSize: "1em",
                }}
              >
                {countries.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c === "All" ? "All Regions" : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex p-1.5 bg-muted/50 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewType("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewType === "grid"
                    ? "bg-card shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewType("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewType === "list"
                    ? "bg-card shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredClients.length > 0 ? (
          viewType === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <ClientGridCard key={client._id} client={client} onClick={() => navigate(`/tasks/${client._id}`)} />
              ))}
            </div>
          ) : (
            <ClientTable clients={filteredClients} onRowClick={(id) => navigate(`/tasks/${id}`)} />
          )
        ) : (
          <EmptyState
            onAdd={() => setIsAddOpen(true)}
            onReset={() => {
              setSearch("");
              setCountryFilter("All");
            }}
          />
        )}
      </div>

      {isAddOpen && (
        <AddClientModal
          formData={formData}
          onChange={onFormChange}
          onClose={() => {
            if (!createMutation.isPending) {
              setIsAddOpen(false);
            }
          }}
          onSubmit={onSubmitClient}
          isSubmitting={createMutation.isPending}
          errorMessage={createMutation.error?.response?.data?.message || createMutation.error?.message}
        />
      )}
    </div>
  );
}

function AddClientModal({ formData, onChange, onClose, onSubmit, isSubmitting, errorMessage }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Client Intake</p>
            <h3 className="text-xl font-bold mt-1">Add New Client</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={onChange}
              placeholder="Acme Holdings"
              required
            />
            <Field
              label="Country"
              name="country"
              value={formData.country}
              onChange={onChange}
              placeholder="India"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Entity Type"
              name="entity_type"
              value={formData.entity_type}
              onChange={onChange}
              placeholder="Private Limited"
              required
            />
            <Field
              label="Govt ID Type"
              name="govt_id_type"
              value={formData.govt_id_type}
              onChange={onChange}
              placeholder="GSTIN / EIN / VAT"
            />
          </div>

          <Field
            label="Govt ID"
            name="govt_id"
            value={formData.govt_id}
            onChange={onChange}
            placeholder="Optional unique identifier"
          />

          {errorMessage ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMessage}</p>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-border font-semibold hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full h-11 px-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </label>
  );
}

function StatCard({ title, value, trend, icon }) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-center mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          {cloneElement(icon, { size: 20 })}
        </div>
        <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
          {trend} <ArrowUpRight size={12} />
        </span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{title}</p>
        <h3 className="text-3xl font-bold text-foreground mt-1 tabular-nums">{value}</h3>
      </div>
    </div>
  );
}

function ClientGridCard({ client, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-2xl p-6 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <Building2 size={24} />
        </div>
        <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider border border-primary/10">
          {client.country}
        </span>
      </div>

      <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
        {client.company_name}
      </h3>
      <p className="text-muted-foreground text-xs mb-6 font-medium uppercase tracking-tighter">
        ID: {client.govt_id || "NOT ASSIGNED"}
      </p>

      <div className="space-y-3 pt-5 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Entity</span>
          <span className="text-xs font-bold text-foreground">{client.entity_type || "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Status</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              client.govt_id ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50"
            }`}
          >
            {client.govt_id ? "COMPLIANT" : "PENDING"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ClientTable({ clients, onRowClick }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em] border-b border-border">
              <th className="p-5">Corporate Identity</th>
              <th className="p-5">Jurisdiction</th>
              <th className="p-5">Classification</th>
              <th className="p-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {clients.map((c) => (
              <tr
                key={c._id}
                onClick={() => onRowClick(c._id)}
                className="hover:bg-muted/20 cursor-pointer transition-colors group"
              >
                <td className="p-5">
                  <div className="font-bold text-foreground group-hover:text-primary transition-colors text-base">
                    {c.company_name}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-tighter">
                    REF: {c.govt_id || "MISSING"}
                  </div>
                </td>
                <td className="p-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-background border border-border text-[11px] font-bold text-foreground shadow-sm">
                    {c.country}
                  </span>
                </td>
                <td className="p-5 text-muted-foreground font-medium">{c.entity_type || "General Entity"}</td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2 text-primary font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    View Dossier <ChevronRight size={14} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-10 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-card rounded mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card rounded-2xl border border-border" />
          ))}
        </div>
        <div className="h-64 bg-card rounded-xl border border-border" />
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl bg-card border border-border p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Unable to load clients</h3>
        <p className="text-sm text-muted-foreground">Please check your backend server and refresh.</p>
      </div>
    </div>
  );
}

function EmptyState({ onAdd, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-border rounded-3xl bg-card/30">
      <div className="w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center mb-6 text-muted-foreground">
        <Briefcase size={32} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">No clients found</h3>
      <p className="text-muted-foreground text-sm text-center max-w-xs mb-8">
        Your portfolio is currently empty. Add your first client to start monitoring compliance.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
        >
          + Add Your First Client
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-6 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-all"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default Clients;
