import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import NavBar from "../components/NavBar";

export default function StrainsPage() {
  const [strains, setStrains] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [tankMap, setTankMap] = useState({});
  const [name, setName] = useState("");
  const [genotype, setGenotype] = useState("");
  const [strainIdNumber, setStrainIdNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [tankId, setTankId] = useState("");

  useEffect(() => {
    fetchStrains();
    fetchAvailableTanks();
    fetchAllTankAssignments();
  }, []);

  const fetchStrains = async () => {
    const { data, error } = await supabase
      .from("strains")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setStrains(data || []);
  };

  const fetchAvailableTanks = async () => {
    const { data, error } = await supabase
      .from("tanks")
      .select("id, tank_id")
      .is("strain_id", null); // only tanks with no strain
    if (!error) setTanks(data || []);
  };

  const fetchAllTankAssignments = async () => {
    const { data, error } = await supabase
      .from("tanks")
      .select("id, strain_id, tank_id");
    if (!error) {
      const map = {};
      data.forEach((tank) => {
        if (tank.strain_id) {
          map[tank.strain_id] = tank.tank_id;
        }
      });
      setTankMap(map);
    }
  };

  const handleAddStrain = async () => {
    if (!name || !genotype) return;

    const { data, error } = await supabase
      .from("strains")
      .insert([{ name, genotype, notes, strain_id_number: strainIdNumber }])
      .select();

    const newStrain = data?.[0];

    if (newStrain && tankId) {
      await supabase
        .from("tanks")
        .update({ strain_id: newStrain.id, active: true })
        .eq("id", tankId);
    }

    setName("");
    setGenotype("");
    setStrainIdNumber("");
    setNotes("");
    setTankId("");
    fetchStrains();
    fetchAvailableTanks();
    fetchAllTankAssignments();
  };

  const handleDelete = async (id) => {
    await supabase.from("strains").delete().eq("id", id);
    fetchStrains();
    fetchAvailableTanks();
    fetchAllTankAssignments();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <NavBar />
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-700">🧬 Strain Management</h1>

        <div className="bg-white p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-xl font-semibold">Add New Strain</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="p-2 border rounded w-full"
              placeholder="Strain name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="p-2 border rounded w-full"
              placeholder="Genotype"
              value={genotype}
              onChange={(e) => setGenotype(e.target.value)}
            />
            <input
              className="p-2 border rounded w-full"
              placeholder="Strain ID Number"
              value={strainIdNumber}
              onChange={(e) => setStrainIdNumber(e.target.value)}
            />
          </div>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded"
            value={tankId}
            onChange={(e) => setTankId(e.target.value)}
          >
            <option value="">Assign to available tank (optional)</option>
            {tanks.map((tank) => (
              <option key={tank.id} value={tank.id}>
                {tank.tank_id}
              </option>
            ))}
          </select>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleAddStrain}
          >
            ➕ Add Strain
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">Current Strains</h2>
          {strains.length === 0 ? (
            <p className="text-gray-500">No strains added yet.</p>
          ) : (
            <ul className="space-y-3">
              {strains.map((strain) => (
                <li
                  key={strain.id}
                  className="p-4 bg-gray-50 border rounded-xl flex justify-between items-start"
                >
                  <div>
                    <h3 className="text-lg font-medium">{strain.name}</h3>
                    {strain.strain_id_number && (
                      <p className="text-sm text-gray-600">
                        <strong>ID:</strong> {strain.strain_id_number}
                      </p>
                    )}
                    <p className="text-sm text-gray-700">
                      <strong>Genotype:</strong> {strain.genotype}
                    </p>
                    {strain.notes && (
                      <p className="text-sm text-gray-500 mt-1">{strain.notes}</p>
                    )}
                    {tankMap[strain.id] && (
                      <p className="text-sm mt-1">
                        <strong>Assigned Tank:</strong>{" "}
                        <a
                          href="/tanks"
                          className="text-blue-600 hover:underline"
                        >
                          {tankMap[strain.id]}
                        </a>
                      </p>
                    )}
                  </div>
                  <button
                    className="text-red-600 hover:text-red-800 font-semibold"
                    onClick={() => handleDelete(strain.id)}
                  >
                    🗑 Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
