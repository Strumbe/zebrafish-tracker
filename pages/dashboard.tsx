// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { Fish, BookOpen, FlaskConical, Users, ChevronDown, ChevronRight } from "lucide-react";

const RACKS = ["ARF1", "ARF2", "ARF3", "ARF4", "ARF5", "ARF6"];
const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLUMNS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function Dashboard() {
  const router = useRouter();
  const [strainCount, setStrainCount] = useState(0);
  const [tankCount, setTankCount] = useState(0);
  const [breedingCount, setBreedingCount] = useState(0);
  const [userCount] = useState(4); // static
  const [tankGrid, setTankGrid] = useState([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    // Load stats
    supabase.from("strains").select("*", { count: "exact", head: true })
      .then(({ count }) => setStrainCount(count || 0));
    supabase.from("tanks").select("*", { count: "exact", head: true }).eq("active", true)
      .then(({ count }) => setTankCount(count || 0));
    supabase.from("breeding_logs").select("*", { count: "exact", head: true })
      .then(({ count }) => setBreedingCount(count || 0));

    // Load grid & set expanded racks
    supabase
      .from("tanks")
      .select("id, tank_id, active, total_fish, strain_id, strains:strain_id(name, strain_id_number)")
      .then(({ data }) => {
        const grid = data || [];
        setTankGrid(grid);
        const activeRacks = new Set(grid.filter(t => t.active).map(t => t.tank_id.split("-")[0]));
        setExpanded(Array.from(activeRacks));
      });
  }, []);

  const toggle = (r: string) =>
    setExpanded(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );

  const getTank = (rack: string, row: string, col: number) =>
    tankGrid.find(t => t.tank_id === `${rack}-${row}-${col}`);

  const borderClass = (tank) => {
    if (!tank) return "border-gray-300";
    if (!tank.active) return "border-gray-400";
    return tank.total_fish > 0 ? "border-green-500" : "border-red-500";
  };

  return (
    <div className="min-h-screen bg-blue-50 px-6 py-8">

      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">🐟 Zebrafish Tracker</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here’s a quick look at your lab activity.
        </p>
      </div>

      {/* Login/Register Buttons */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 mx-auto block"
        >
          Login
        </button>
        <button
          onClick={() => router.push('/register')}
          className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition mx-auto block"
        >
          Register
        </button>
      </div>

      {/* Condensed Stat Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[
          {
            title: "Strains",
            count: strainCount,
            subtitle: "Total strains",
            icon: <Fish className="w-5 h-5 text-blue-600" />,
            path: "/strains",
          },
          {
            title: "Tanks",
            count: tankCount,
            subtitle: "Active tanks",
            icon: <BookOpen className="w-5 h-5 text-blue-600" />,
            path: "/tanks",
          },
          {
            title: "Breeding",
            count: breedingCount,
            subtitle: "Crosses logged",
            icon: <FlaskConical className="w-5 h-5 text-blue-600" />,
            path: "/breeding",
          },
          {
            title: "Users",
            count: userCount,
            subtitle: "Active members",
            icon: <Users className="w-5 h-5 text-blue-600" />,
            path: "/users",
          },
        ].map(card => (
          <div
            key={card.title}
            onClick={() => router.push(card.path)}
            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-center items-center text-center hover:bg-blue-100"
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              {card.icon}
              <h2 className="text-sm font-semibold text-gray-800">{card.title}</h2>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{card.count}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total Active Tanks */}
      <div className="text-center text-lg font-medium text-gray-800 mb-4">
        🐠 Active Tanks: <span className="font-bold">{tankCount}</span>
      </div>

      {/* Rack Schematic */}
      <div className="max-w-6xl mx-auto space-y-6">
        {RACKS.map(rack => (
          <div key={rack} className="bg-white rounded-lg shadow-sm">
            <button
              className="w-full flex items-center justify-between px-5 py-3 text-lg font-semibold text-gray-800 hover:bg-gray-50 transition"
              onClick={() => toggle(rack)}
            >
              <span>{rack}</span>
              {expanded.includes(rack) ? <ChevronDown /> : <ChevronRight />}
            </button>
            {expanded.includes(rack) && (
              <div className="overflow-x-auto p-4">
                <table className="table-fixed border-collapse w-full">
                  <tbody>
                    {ROWS.map(row => (
                      <tr key={row}>
                        {COLUMNS.map(col => {
                          const tank = getTank(rack, row, col);
                          return (
                            <td
                              key={`${rack}-${row}-${col}`}
                              className={`p-2 text-xs text-center border ${borderClass(tank)} cursor-pointer hover:bg-gray-50`}
                              onClick={() => tank && router.push(`/tanks/${tank.id}`)}
                            >
                              <div className="font-medium">{`${rack}-${row}-${col}`}</div>
                              <div className="text-gray-600 truncate">{tank?.strains?.name || "—"}</div>
                              <div className="text-gray-400 text-[10px]">{tank?.strains?.strain_id_number || "—"}</div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
