import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import NavBar from "../../components/NavBar";

export default function TankArchivePage() {
  const [archive, setArchive] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [filterStrain, setFilterStrain] = useState("");
  const [filterTank, setFilterTank] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchArchive();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [archive, filterStrain, filterTank, startDate, endDate]);

  const fetchArchive = async () => {
    const { data, error } = await supabase
      .from("tank_archive")
      .select("*, strains ( name )")
      .order("archived_at", { ascending: false });

    if (!error) setArchive(data || []);
  };

  const applyFilters = () => {
    let result = archive;

    if (filterStrain) {
      result = result.filter((a) =>
        a.strains?.name?.toLowerCase().includes(filterStrain.toLowerCase())
      );
    }

    if (filterTank) {
      result = result.filter((a) =>
        a.tank_id?.toLowerCase().includes(filterTank.toLowerCase())
      );
    }

    if (startDate) {
      result = result.filter(
        (a) => new Date(a.archived_at || a.created_at) >= new Date(startDate)
      );
    }

    if (endDate) {
      result = result.filter(
        (a) => new Date(a.archived_at || a.created_at) <= new Date(endDate)
      );
    }

    setFiltered(result);
  };

  const exportToCSV = () => {
    const headers = [
      "Tank ID",
      "Strain",
      "Archived At",
      "Total",
      "Larval",
      "Male",
      "Female",
      "Deceased",
      "Notes",
    ];

    const rows = filtered.map((entry) => [
      entry.tank_label,  // use label not uuid
      entry.strains?.name || "",
      new Date(entry.archived_at || entry.created_at).toLocaleString(),
      entry.total_fish ?? "",
      entry.larval_count ?? "",
      entry.male_count ?? "",
      entry.female_count ?? "",
      entry.deceased_count ?? "",
      entry.notes ?? "",
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `tank_archive_export_${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NavBar />
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-700">🗃 Tank Archive</h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Strain</label>
            <input
              type="text"
              value={filterStrain}
              onChange={(e) => setFilterStrain(e.target.value)}
              className="border p-2 rounded"
              placeholder="Search strain..."
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Tank ID</label>
            <input
              type="text"
              value={filterTank}
              onChange={(e) => setFilterTank(e.target.value)}
              className="border p-2 rounded"
              placeholder="e.g. ARF1-A-3"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            📤 Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-xl shadow">
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 border">Tank ID</th>
                <th className="p-2 border">Strain</th>
                <th className="p-2 border">Archived At</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Larval</th>
                <th className="p-2 border">Male</th>
                <th className="p-2 border">Female</th>
                <th className="p-2 border">Deceased</th>
                <th className="p-2 border">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 border">{entry.tank_label}</td>
                  <td className="p-2 border">{entry.strains?.name || "—"}</td>
                  <td className="p-2 border">
                    {new Date(entry.archived_at || entry.created_at).toLocaleString()}
                  </td>
                  <td className="p-2 border">{entry.total_fish ?? "—"}</td>
                  <td className="p-2 border">{entry.larval_count ?? "—"}</td>
                  <td className="p-2 border">{entry.male_count ?? "—"}</td>
                  <td className="p-2 border">{entry.female_count ?? "—"}</td>
                  <td className="p-2 border">{entry.deceased_count ?? "—"}</td>
                  <td className="p-2 border text-gray-600">{entry.notes || <em>None</em>}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500 italic">
                    No archived tanks match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
