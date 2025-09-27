// src/pages/plants/Plants.js
// My Plants: list + add plant modal (uses mockApi dummy data)

import React, { useEffect, useMemo, useState } from "react";
import {
  FaLeaf,
  FaMapMarkerAlt,
  FaSun,
  FaTint,
  FaFlask,
  FaPlus,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import {
  getCurrentUser,
  getSpaces,
  getUserPlants,
  listPlants,
  addUserPlant,
  getSuggestions,
} from "../../lib/mockApi/mockApi";
import { useNavigate } from "react-router-dom";

/* --- tiny SVG header image (same style as dashboard water card) --- */
const LIGHT_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='240' viewBox='0 0 600 240'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='#A7F3D0'/>
      <stop offset='100%' stop-color='#6EE7B7'/>
    </linearGradient>
  </defs>
  <rect width='600' height='240' fill='url(#g)'/>
  <g opacity='0.25'>
    <circle cx='480' cy='60' r='42' fill='#FDE68A'/>
  </g>
  <g>
    <path d='M140 190c26-52 65-52 91 0c-26-13-65-13-91 0z' fill='#059669'/>
    <rect x='166' y='135' width='16' height='52' rx='8' fill='#047857'/>
    <path d='M174 130c18-31 48-35 66-9c-22-4-44 5-66 18z' fill='#10B981'/>
  </g>
</svg>`;
const LIGHT_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(LIGHT_SVG);

/* --- local helper to remove a user plant from mock storage --- */
function removeUserPlant(id) {
  const key = "pm_user_plants";
  const arr = JSON.parse(localStorage.getItem(key) || "[]").filter((p) => p.id !== id);
  localStorage.setItem(key, JSON.stringify(arr));
  return arr;
}

export default function Plants() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [spaces, setSpaces] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [myPlants, setMyPlants] = useState([]);
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    if (!user) return;
    setSpaces(getSpaces(user._id));
    setCatalog(listPlants());
    setMyPlants(getUserPlants(user._id));
  }, [user]);

  const spaceById = useMemo(() => {
    const m = new Map();
    spaces.forEach((s) => m.set(s.id, s));
    return m;
  }, [spaces]);

  const plantBySlug = useMemo(() => {
    const m = new Map();
    catalog.forEach((p) => m.set(p.slug, p));
    return m;
  }, [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return myPlants;
    return myPlants.filter((up) => {
      const cat = plantBySlug.get(up.plant_id);
      return (
        up.nickname?.toLowerCase().includes(q) ||
        cat?.common_name?.toLowerCase().includes(q) ||
        cat?.scientific_name?.toLowerCase().includes(q)
      );
    });
  }, [myPlants, plantBySlug, query]);

  const handleDelete = (id) => {
    const next = removeUserPlant(id);
    setMyPlants(next);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold text-emerald-900">My Plants</h1>
        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/80" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="pl-9 pr-3 py-2 rounded-xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <button
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl"
          >
            <FaPlus /> Add Plant
          </button>
        </div>
      </div>

      {/* Empty state */}
      {myPlants.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 p-6 bg-white text-emerald-800">
          No plants yet. Click <b>Add Plant</b> to start your garden 🌿
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((up) => {
            const cat = plantBySlug.get(up.plant_id);
            const sp = spaceById.get(up.space_id);
            return (
              <li
                key={up.id}
                className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden"
              >
                <div className="h-24 w-full">
                  <img
                    src={LIGHT_IMG}
                    alt="Plant header"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <FaLeaf className="text-emerald-700" />
                        {up.nickname || cat?.common_name || up.plant_id}
                      </div>
                      <div className="text-sm text-emerald-800/80">
                        {cat?.common_name} <span className="text-emerald-700/60">•</span>{" "}
                        <i>{cat?.scientific_name}</i>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 capitalize">
                      {up.status || "active"}
                    </span>
                  </div>

                  {/* chips */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <Chip
                      icon={<FaMapMarkerAlt />}
                      label="Space"
                      value={sp?.name || "-"}
                    />
                    <Chip
                      icon={<FaSun />}
                      label="Light"
                      value={sp?.sunlight_hours != null ? `${sp.sunlight_hours}h` : "-"}
                    />
                    <Chip
                      icon={<FaTint />}
                      label="Water"
                      value={(cat?.watering_need || "-").toUpperCase()}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Chip
                      icon={<FaFlask />}
                      label="Fertilize"
                      value={
                        cat?.fertilization_freq_days
                          ? `~${cat.fertilization_freq_days}d`
                          : "-"
                      }
                    />
                    <Chip
                      icon={<FaLeaf />}
                      label="Pot"
                      value={
                        cat?.pot_size_min_liters
                          ? `${cat.pot_size_min_liters}L+`
                          : "-"
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/plants/${up.id}`)}
                      className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDelete(up.id)}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm inline-flex items-center gap-2"
                    >
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {openAdd && (
        <AddPlantModal
          spaces={spaces}
          catalog={catalog}
          onClose={() => setOpenAdd(false)}
          onAdded={(row) => {
            setMyPlants((prev) => [row, ...prev]);
            setOpenAdd(false);
          }}
        />
      )}
    </div>
  );
}

function Chip({ icon, label, value }) {
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

function AddPlantModal({ spaces, catalog, onClose, onAdded }) {
  const user = getCurrentUser();
  const [spaceId, setSpaceId] = useState(spaces[0]?.id || "");
  const [useRecs, setUseRecs] = useState(true);
  const [nickname, setNickname] = useState("");
  const [plantSlug, setPlantSlug] = useState("");

  const recs = useMemo(() => {
    if (!useRecs || !spaceId || !user) return [];
    return getSuggestions(user._id, spaceId, 12); // simple rules-based recs from mockApi
  }, [user, spaceId, useRecs]);

  const recSlugs = new Set(recs.map((r) => r.plant_slug));
  const options = useRecs
    ? catalog.filter((p) => recSlugs.has(p.slug))
    : catalog;

  const submit = (e) => {
    e.preventDefault();
    if (!user) return;
    if (!spaceId) return alert("Please select a space");
    if (!plantSlug) return alert("Please select a plant");

    const row = addUserPlant({
      user_id: user._id,
      space_id: spaceId,
      plant_slug: plantSlug,
      nickname: nickname.trim(),
    });
    onAdded(row);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-emerald-600 text-white font-semibold">
          Add Plant
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Space</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                value={spaceId}
                onChange={(e) => setSpaceId(e.target.value)}
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <input
                id="useRecs"
                type="checkbox"
                className="h-5 w-5 accent-emerald-600"
                checked={useRecs}
                onChange={(e) => setUseRecs(e.target.checked)}
              />
              <label htmlFor="useRecs" className="text-sm text-gray-700">
                Show recommended only
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Plant {useRecs && <span className="text-emerald-700">(recommended)</span>}
            </label>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              value={plantSlug}
              onChange={(e) => setPlantSlug(e.target.value)}
            >
              <option value="">-- Select a plant --</option>
              {options.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.common_name} ({p.scientific_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Nickname (optional)</label>
            <input
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              placeholder="My Basil"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Add
            </button>
          </div>

          {useRecs && recs.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-emerald-900 mb-2">Top Matches</div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recs.slice(0, 4).map((r) => (
                  <li
                    key={r.plant_slug}
                    className={`p-3 rounded-xl border ${
                      r.plant_slug === plantSlug
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-emerald-100 hover:bg-emerald-50/50"
                    } cursor-pointer`}
                    onClick={() => setPlantSlug(r.plant_slug)}
                    title={r.rationale}
                  >
                    <div className="font-medium text-emerald-900">{r.common_name}</div>
                    <div className="text-xs text-emerald-800/80">Score: {r.score}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
