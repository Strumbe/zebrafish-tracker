import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import NavBar from "../components/NavBar";

export default function BreedingLogPage() {
  const [date, setDate] = useState("");
  const [strain, setStrain] = useState("");
  const [strainId, setStrainId] = useState("");
  const [dob, setDob] = useState("");
  const [numFish, setNumFish] = useState("");
  const [cross, setCross] = useState("");
  const [tankId, setTankId] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase.from("breeding_logs").select("*").order("date", { ascending: false });
    if (!error) setLogs(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("breeding_logs").insert([
      { date, strain, strain_id: strainId, dob, num_fish: numFish, female_x_male: cross, tank_id: tankId, comments },
    ]);
    if (!error) {
      setDate(""); setStrain(""); setStrainId(""); setDob(""); setNumFish(""); setCross(""); setTankId(""); setComments("");
      fetchLogs();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NavBar />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">🧬 Breeding Log</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4 mb-10">
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
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {loading ? "Saving..." : "Add Breeding Log"}
          </button>
        </form>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Strain</th>
                  <th className="p-2">ID</th>
                  <th className="p-2">DOB</th>
                  <th className="p-2"># Fish</th>
                  <th className="p-2">F x M</th>
                  <th className="p-2">Tank ID</th>
                  <th className="p-2">Comments</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{log.date}</td>
                    <td className="p-2">{log.strain}</td>
                    <td className="p-2">{log.strain_id}</td>
                    <td className="p-2">{log.dob}</td>
                    <td className="p-2">{log.num_fish}</td>
                    <td className="p-2">{log.female_x_male}</td>
                    <td className="p-2">{log.tank_id}</td>
                    <td className="p-2">{log.comments}</td>
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
