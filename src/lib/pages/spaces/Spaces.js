// src/pages/spaces/Spaces.jsx
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaCompass,
  FaSun,
  FaMapMarkerAlt,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

const DIRECTIONS = ["N","NE","E","SE","S","SW","W","NW"];
const DUMMY_SPACES = [
  { id: "s1", name: "South Balcony", type: "balcony", direction: "S", sunlight_hours: 6, area_sq_m: 1.8, notes: "" },
  { id: "s2", name: "Kitchen Window", type: "windowsill", direction: "E", sunlight_hours: 3, area_sq_m: 0.6, notes: "" },
];

export default function Spaces() {
  const [spaces, setSpaces] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    // try backend; fallback to localStorage; else dummy
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:7777/api/spaces", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSpaces(data || []);
        localStorage.setItem("spaces", JSON.stringify(data || []));
      } catch {
        const cached = JSON.parse(localStorage.getItem("spaces") || "null");
        setSpaces(cached || DUMMY_SPACES);
        if (!cached) localStorage.setItem("spaces", JSON.stringify(DUMMY_SPACES));
      }
    };
    load();
  }, []);

  const upsertLocal = (list) => localStorage.setItem("spaces", JSON.stringify(list));

  const handleSave = (payload) => {
    let next;
    if (editing) {
      next = spaces.map(s => s.id === editing.id ? { ...editing, ...payload } : s);
    } else {
      next = [{ id: String(Date.now()), ...payload }, ...spaces];
    }
    setSpaces(next);
    upsertLocal(next);
    setEditing(null);
    setOpen(false);
  };

  const handleDelete = (id) => {
    const next = spaces.filter(s => s.id !== id);
    setSpaces(next);
    upsertLocal(next);
  };

  return (
    <div className="p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-emerald-900">Your Spaces</h1>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl"
        >
          <FaPlus /> Add Space
        </button>
      </div>

      {/* grid */}
      {spaces.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 p-6 bg-white text-emerald-800">
          No spaces yet. Click <b>Add Space</b> to begin.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((s) => (
            <li key={s.id} className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-emerald-600 to-emerald-500" />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold text-emerald-900">{s.name}</div>
                    <div className="text-xs uppercase tracking-wide text-emerald-700/80">{s.type}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(s); setOpen(true); }}
                      className="p-2 rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Pill icon={<FaMapMarkerAlt />} label="Area" value={`${s.area_sq_m} m²`} />
                  <Pill icon={<FaCompass />} label="Dir" value={s.direction} />
                  <Pill icon={<FaSun />} label="Sun" value={`${s.sunlight_hours}h`} />
                </div>

                {s.notes ? (
                  <p className="text-sm text-emerald-800/80">{s.notes}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <SpaceModal
          initial={editing || { name: "", type: "balcony", direction: "S", sunlight_hours: 4, area_sq_m: 1, notes: "" }}
          onClose={() => { setOpen(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function Pill({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2">
      <div className="flex items-center gap-2 text-emerald-800">
        <span className="text-emerald-700">{icon}</span>
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-0.5 font-medium text-emerald-900">{value}</div>
    </div>
  );
}

function SpaceModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    // minimal validation
    if (!form.name?.trim()) return alert("Name is required");
    if (!DIRECTIONS.includes(form.direction)) return alert("Direction invalid");
    if (form.sunlight_hours < 0 || form.sunlight_hours > 12) return alert("Sunlight must be 0–12");
    if (form.area_sq_m <= 0) return alert("Area must be > 0");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-emerald-600 text-white font-semibold">
          {initial.id ? "Edit Space" : "Add Space"}
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="South Balcony"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Type</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="balcony">Balcony</option>
                <option value="windowsill">Windowsill</option>
                <option value="terrace">Terrace</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Direction</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                value={form.direction}
                onChange={(e) => update("direction", e.target.value)}
              >
                {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Sunlight (hours/day)</label>
              <input
                type="number"
                min={0}
                max={12}
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                value={form.sunlight_hours}
                onChange={(e) => update("sunlight_hours", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Area (m²)</label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                value={form.area_sq_m}
                onChange={(e) => update("area_sq_m", Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Windy in monsoon; partial shade after 2 PM."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
