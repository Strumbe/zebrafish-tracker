import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import NavBar from "../components/NavBar";
import Link from "next/link";

export default function TanksPage() {
  const [tanks, setTanks] = useState([]);
  const [strainId, setStrainId] = useState("");
  const [tankId, setTankId] = useState("");
  const [dob, setDob] = useState("");
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState("");
  const [strains, setStrains] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filterActive, setFilterActive] = useState("all");
  const [filterRack, setFilterRack] = useState("all");
  const [filterRow, setFilterRow] = useState("all");

  useEffect(() => {
    fetchTanks();
    fetchStrains();
  }, []);

  const fetchTanks = async () => {
    const { data } = await supabase
      .from("tanks")
      .select("*, strains ( name )")
      .order("created_at", { ascending: false });
    setTanks(data || []);
  };

  const fetchStrains = async () => {
    const { data } = await supabase.from("strains").select("id, name");
    setStrains(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      tank_id: tankId,
      strain_id: strainId || null,
      dob: dob || null,
      active,
      notes,
    };

    if (editingId) {
      await supabase.from("tanks").update(payload).eq("id", editingId);
      setEditingId(null);
    } else {
      await supabase.from("tanks").insert([payload]);
    }

    resetForm();
    fetchTanks();
  };

  const resetForm = () => {
    setTankId("");
    setStrainId("");
    setDob("");
    setActive(true);
    setNotes("");
  };

  const handleEdit = (tank) => {
    setTankId(tank.tank_id);
    setStrainId(tank.strain_id || "");
    setDob(tank.dob || "");
    setActive(tank.active);
    setNotes(tank.notes || "");
    setEditingId(tank.id);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this tank and all related notes and logs?"
    );
    if (!confirmed) return;

    await supabase.from("tank_notes").delete().eq("tank_id", id);
    await supabase.from("tank_logs").delete().eq("tank_id", id);
    await supabase.from("tank_archive").delete().eq("tank_id", id);
    await supabase.from("tanks").delete().eq("id", id);
    fetchTanks();
  };

  const filteredTanks = tanks.filter((tank) => {
    const isActiveMatch =
      filterActive === "all" ||
      (filterActive === "active" && tank.active) ||
      (filterActive === "inactive" && !tank.active);
    const isRackMatch =
      filterRack === "all" ||
      tank.tank_id.startsWith(`ARF${filterRack}`);
    const isRowMatch =
      filterRow === "all" ||
      tank.tank_id.split("-")[1] === filterRow;
    return isActiveMatch && isRackMatch && isRowMatch;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NavBar />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">🧪 Tank Management</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="p-2 border rounded"
              value={tankId}
              onChange={(e) => setTankId(e.target.value)}
              placeholder="Tank ID (e.g. ARF6-D-2)"
            />
            <select
              className="p-2 border rounded"
              value={strainId}
              onChange={(e) => setStrainId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {strains.map((strain) => (
                <option key={strain.id} value={strain.id}>{strain.name}</option>
              ))}
            </select>
            <input
              className="p-2 border rounded"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={active} onChange={() => setActive(!active)} /> Active
            </label>
            <input
              className="p-2 border rounded col-span-full"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editingId ? "Update Tank" : "Add Tank"}
          </button>
        </form>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="font-medium">Show:</label>
              <select
                className="border rounded p-2 text-sm"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium">Rack:</label>
              <select
                className="border rounded p-2 text-sm"
                value={filterRack}
                onChange={(e) => setFilterRack(e.target.value)}
              >
                <option value="all">All Racks</option>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>{`ARF${num}`}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium">Row:</label>
              <select
                className="border rounded p-2 text-sm"
                value={filterRow}
                onChange={(e) => setFilterRow(e.target.value)}
              >
                <option value="all">All Rows</option>
                {["A", "B", "C", "D", "E", "F"].map((row) => (
                  <option key={row} value={row}>{row}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">Tank ID</th>
                  <th className="p-2">Strain</th>
                  <th className="p-2">DOB</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Notes</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTanks.map((tank) => (
                  <tr key={tank.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 text-blue-600 hover:underline">
                    <Link href={`/tanks/${tank.id}`}>{tank.tank_id}</Link>
                    </td>
                    <td className="p-2">{tank.strains?.name || <em className="text-gray-400">Unassigned</em>}</td>
                    <td className="p-2">{tank.dob || <em className="text-gray-400">N/A</em>}</td>
                    <td className="p-2">{tank.active ? "✅" : "❌"}</td>
                    <td className="p-2">{tank.notes}</td>
                    <td className="p-2 space-x-2 whitespace-nowrap">
                      <button onClick={() => handleEdit(tank)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(tank.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}