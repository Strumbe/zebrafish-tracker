import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import NavBar from "../../components/NavBar";

export default function TankDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [tank, setTank] = useState(null);
  const [strain, setStrain] = useState(null);
  const [loading, setLoading] = useState(true);

  const [totalFish, setTotalFish] = useState("");
  const [larval, setLarval] = useState("");
  const [male, setMale] = useState("");
  const [female, setFemale] = useState("");
  const [deceased, setDeceased] = useState("");

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (id) {
      fetchTankData();
      fetchNotes();
      fetchLogHistory();
    }
  }, [id]);

  const fetchTankData = async () => {
    setLoading(true);
    const { data: tankData } = await supabase
      .from("tanks")
      .select("*, strains ( name, strain_id_number )")
      .eq("id", id)
      .single();

    if (tankData) {
      setTank(tankData);
      setStrain(tankData.strains || null);
      setTotalFish(tankData.total_fish || "");
      setLarval(tankData.larval_count || "");
      setMale(tankData.male_count || "");
      setFemale(tankData.female_count || "");
      setDeceased(tankData.deceased_count || "");
    }
    setLoading(false);
  };

  const fetchNotes = async () => {
    const { data } = await supabase
      .from("tank_notes")
      .select("*")
      .eq("tank_id", id)
      .order("timestamp", { ascending: false });

    setNotes(data || []);
  };

  const fetchLogHistory = async () => {
    const { data } = await supabase
      .from("tank_logs")
      .select("*")
      .eq("tank_id", id)
      .order("timestamp", { ascending: false });

    setLogs(data || []);
  };

  const handleSave = async () => {
    await supabase
      .from("tanks")
      .update({
        total_fish: totalFish || null,
        larval_count: larval || null,
        male_count: male || null,
        female_count: female || null,
        deceased_count: deceased || null,
      })
      .eq("id", id);

    await supabase.from("tank_logs").insert([
      {
        tank_id: id,
        total_fish: totalFish || null,
        larval_count: larval || null,
        male_count: male || null,
        female_count: female || null,
        deceased_count: deceased || null,
      },
    ]);

    fetchTankData();
    fetchLogHistory();
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await supabase.from("tank_notes").insert([{ tank_id: id, note: newNote }]);
    setNewNote("");
    fetchNotes();
  };

  const handleClearTank = async () => {
    const confirm = window.confirm("Are you sure you want to clear and reset this tank for reuse?");
    if (!confirm || !tank) return;

    await supabase.from("tank_archive").insert([
      {
        tank_id: tank.id,
        strain_id: tank.strain_id,
        total_fish: tank.total_fish,
        larval_count: tank.larval_count,
        male_count: tank.male_count,
        female_count: tank.female_count,
        deceased_count: tank.deceased_count,
        notes: tank.notes || null,
      },
    ]);

    await supabase
      .from("tanks")
      .update({
        strain_id: null,
        active: false,
        total_fish: null,
        larval_count: null,
        male_count: null,
        female_count: null,
        deceased_count: null,
      })
      .eq("id", tank.id);

    const timestamp = new Date().toLocaleString();
    const systemNote = `Tank cleared on ${timestamp}`;
    await supabase.from("tank_notes").insert([{ tank_id: tank.id, note: systemNote }]);

    fetchTankData();
    fetchNotes();
    fetchLogHistory();
  };

  if (loading || !tank) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <NavBar />
        <div className="max-w-2xl mx-auto text-center text-gray-500">
          Loading tank details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NavBar />
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-700">Tank Details: {tank.tank_id}</h1>

        {/* Tank Assignment Status */}
        {!tank.strain_id ? (
          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-xl text-yellow-900">
            <p><strong>This tank is currently unassigned and ready for reuse.</strong></p>
          </div>
        ) : (
          <>
            {/* Strain Info */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Strain Information</h2>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {strain?.name}</p>
                <p><strong>Strain ID:</strong> {strain?.strain_id_number || "N/A"}</p>
              </div>
            </div>

            {/* Fish Counts */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Fish Stock</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input className="p-2 border rounded" type="number" placeholder="Total Fish" value={totalFish} onChange={(e) => setTotalFish(e.target.value)} />
                <input className="p-2 border rounded" type="number" placeholder="Larval Count" value={larval} onChange={(e) => setLarval(e.target.value)} />
                <input className="p-2 border rounded" type="number" placeholder="Male Count" value={male} onChange={(e) => setMale(e.target.value)} />
                <input className="p-2 border rounded" type="number" placeholder="Female Count" value={female} onChange={(e) => setFemale(e.target.value)} />
                <input className="p-2 border rounded" type="number" placeholder="Deceased Count" value={deceased} onChange={(e) => setDeceased(e.target.value)} />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4" onClick={handleSave}>
                💾 Save & Log Counts
              </button>
            </div>

            {/* Count Log */}
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">📈 Change History</h2>
              <div className="overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Larval</th>
                      <th className="p-2">Male</th>
                      <th className="p-2">Female</th>
                      <th className="p-2">Deceased</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-2">{log.total_fish ?? "—"}</td>
                        <td className="p-2">{log.larval_count ?? "—"}</td>
                        <td className="p-2">{log.male_count ?? "—"}</td>
                        <td className="p-2">{log.female_count ?? "—"}</td>
                        <td className="p-2">{log.deceased_count ?? "—"}</td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-4 text-gray-500 italic">
                          No logs yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Tank Notes</h2>
          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            placeholder="Add a new comment..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleAddNote}>
            ➕ Add Note
          </button>
          <ul className="mt-4 space-y-2 text-sm">
            {notes.map((note) => (
              <li key={note.id} className="border rounded p-2 bg-gray-50">
                <p className="text-gray-700">{note.note}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(note.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Reuse Button - Always at Bottom */}
        <div className="text-center pt-4">
          <button
            className="text-red-600 underline hover:text-red-800 px-4 py-2"
            onClick={handleClearTank}
          >
            🧼 Clear Tank for Reuse
          </button>
        </div>
      </div>
    </div>
  );
}
