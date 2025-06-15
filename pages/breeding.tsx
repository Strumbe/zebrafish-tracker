import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import NavBar from "../components/NavBar";

export default function BreedingLogPage() {
  const [logs, setLogs] = useState([]);
  const [strain, setStrain] = useState("");
  const [strainId, setStrainId] = useState("");
  const [dob, setDob] = useState("");
  const [numFish, setNumFish] = useState("");
  const [cross, setCross] = useState("");
  const [tankId, setTankId] = useState("");
  const [comments, setComments] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate]);

  const fetchLogs = async () => {
    let query = supabase.from("breeding_logs").select("*").order("date", { ascending: true });
    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate);
    }
    const { data, error } = await query;
    if (!error) setLogs(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date,
      strain,
      strain_id: strainId,
      dob,
      num_fish: numFish,
      female_x_male: cross,
      tank_id: tankId,
      comments,
    };

    if (editingId) {
      await supabase.from("breeding_logs").update(payload).eq("id", editingId);
      setEditingId(null);
    } else {
      await handleCreateLog();
    }

    resetForm();
    fetchLogs();
  };

  const handleCreateLog = async () => {
    const user = supabase.auth.user();
    await supabase.from("breeding_logs").insert([
      {
        strain,
        strain_id: strainId,
        dob,
        num_fish: numFish,
        tank_id: tankId,
        comments,
        user_id: user.id, // Track the user who created the log
      },
    ]);
  };

  const resetForm = () => {
    setDate("");
    setStrain("");
    setStrainId("");
    setDob("");
    setNumFish("");
    setCross("");
    setTankId("");
    setComments("");
  };

  const handleEdit = (log) => {
    setDate(log.date);
    setStrain(log.strain);
    setStrainId(log.strain_id);
    setDob(log.dob);
    setNumFish(log.num_fish);
    setCross(log.female_x_male);
    setTankId(log.tank_id);
    setComments(log.comments);
    setEditingId(log.id);
  };

  const handleDelete = async (id) => {
    await supabase.from("breeding_logs").delete().eq("id", id);
    fetchLogs();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NavBar />
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-blue-700">🧬 Breeding Log</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="p-2 border rounded" type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" />
            <input className="p-2 border rounded" value={strain} onChange={(e) => setStrain(e.target.value)} placeholder="Strain" />
            <input className="p-2 border rounded" value={strainId} onChange={(e) => setStrainId(e.target.value)} placeholder="Strain ID" />
            <input className="p-2 border rounded" type="date" value={dob} onChange={(e) => setDob(e.target.value)} placeholder="DOB" />
            <input className="p-2 border rounded" value={numFish} onChange={(e) => setNumFish(e.target.value)} placeholder="# of Fish" />
            <input className="p-2 border rounded" value={cross} onChange={(e) => setCross(e.target.value)} placeholder="Female x Male" />
            <input className="p-2 border rounded" value={tankId} onChange={(e) => setTankId(e.target.value)} placeholder="Tank ID" />
            <input className="p-2 border rounded col-span-full" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Comments (optional)" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {editingId ? "Update Log" : "Add Breeding Log"}
          </button>
        </form>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Filter by Date</h2>
          <div className="flex flex-wrap gap-4">
            <input type="date" className="border p-2 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" className="border p-2 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button onClick={fetchLogs} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Apply</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow overflow-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 border text-left">Date</th>
                <th className="p-3 border text-left">Strain</th>
                <th className="p-3 border text-left">Strain ID</th>
                <th className="p-3 border text-left">DOB</th>
                <th className="p-3 border text-left"># Fish</th>
                <th className="p-3 border text-left">F x M</th>
                <th className="p-3 border text-left">Tank</th>
                <th className="p-3 border text-left">Comments</th>
                <th className="p-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id} className={`border-t hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-3 border">{log.date}</td>
                  <td className="p-3 border">{log.strain}</td>
                  <td className="p-3 border">{log.strain_id}</td>
                  <td className="p-3 border">{log.dob}</td>
                  <td className="p-3 border">{log.num_fish}</td>
                  <td className="p-3 border">{log.female_x_male}</td>
                  <td className="p-3 border">
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      {log.tank_id}
                    </span>
                  </td>
                  <td className="p-3 border text-sm text-gray-600">{log.comments}</td>
                  <td className="p-3 border whitespace-nowrap space-x-2">
                    <button onClick={() => handleEdit(log)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(log.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}