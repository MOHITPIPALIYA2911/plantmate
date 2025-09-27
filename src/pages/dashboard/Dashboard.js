// src/pages/dashboard/Dashboard.js
// Vertical water-type cards + plant-light image (dummy data fallback)

import React, { useEffect, useState } from 'react';
import {
  FaTint,
  FaMapMarkerAlt,
  FaSun,
  FaClock,
  FaCheckCircle,
  FaLeaf,
} from 'react-icons/fa';

/* ---------- dummy data ---------- */
const DUMMY = {
  waterTasks: [
    {
      id: 't1',
      plantName: 'Basil',
      spaceName: 'South Balcony',
      sunlightHours: 6,
      dueAt: new Date().toISOString(),
      note: 'Keep soil moist, not soggy.',
    },
    {
      id: 't2',
      plantName: 'Mint',
      spaceName: 'Kitchen Window',
      sunlightHours: 3,
      dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      note: 'Avoid waterlogging; drains fast.',
    },
  ],
};

/* ---------- tiny SVG “plant + light” image as data URI ---------- */
const LIGHT_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='#A7F3D0'/>
      <stop offset='100%' stop-color='#6EE7B7'/>
    </linearGradient>
  </defs>
  <rect width='600' height='300' fill='url(#g)'/>
  <g opacity='0.25'>
    <circle cx='500' cy='70' r='50' fill='#FDE68A'/>
    <line x1='500' y1='10' x2='500' y2='0' stroke='#FDE68A' stroke-width='6'/>
    <line x1='560' y1='70' x2='570' y2='70' stroke='#FDE68A' stroke-width='6'/>
    <line x1='500' y1='130' x2='500' y2='140' stroke='#FDE68A' stroke-width='6'/>
    <line x1='440' y1='70' x2='430' y2='70' stroke='#FDE68A' stroke-width='6'/>
  </g>
  <g>
    <path d='M170 220c30-60 75-60 105 0c-30-15-75-15-105 0z' fill='#059669'/>
    <rect x='200' y='155' width='18' height='60' rx='9' fill='#047857'/>
    <path d='M210 150c20-35 55-40 75-10c-25-5-50 5-75 20z' fill='#10B981'/>
  </g>
</svg>`;
const LIGHT_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(LIGHT_SVG);

/* ---------- helpers ---------- */
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ---------- components ---------- */
const DashboardCardWater = ({
  plantName,
  spaceName,
  sunlightHours,
  dueAt,
  note,
  onDone,
  onSnooze,
}) => (
  <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
    {/* image header */}
    <div className="h-28 w-full overflow-hidden">
      <img
        src={LIGHT_IMG}
        alt="Plant light"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>

    {/* content */}
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1">
          <FaTint className="text-emerald-700" />
          Water task
        </span>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
          <FaLeaf className="text-emerald-700" />
          {plantName}
        </h3>
        <p className="text-sm text-emerald-800/80 mt-0.5">{note}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <InfoPill icon={<FaMapMarkerAlt />} label="Space" value={spaceName} />
        <InfoPill icon={<FaSun />} label="Light" value={`${sunlightHours}h`} />
        <InfoPill icon={<FaClock />} label="Due" value={fmtTime(dueAt)} />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onDone}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
        >
          <FaCheckCircle />
          Mark done
        </button>
        <button
          onClick={onSnooze}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 text-emerald-900 hover:bg-emerald-50 text-sm"
        >
          Snooze 2h
        </button>
      </div>
    </div>
  </div>
);

const InfoPill = ({ icon, label, value }) => (
  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2">
    <div className="flex items-center gap-2 text-emerald-800">
      <span className="text-emerald-700">{icon}</span>
      <span className="text-xs uppercase tracking-wide">{label}</span>
    </div>
    <div className="mt-0.5 text-emerald-900 font-medium">{value}</div>
  </div>
);

/* ---------- dashboard ---------- */
const Dashboard = () => {
  const [waterTasks, setWaterTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch; if fails, use dummy
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:7777/api/dashboard/water-tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('fetch failed');

        const result = await res.json();
        setWaterTasks(result?.waterTasks || DUMMY.waterTasks);
      } catch {
        setWaterTasks(DUMMY.waterTasks);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDone = (id) => {
    setWaterTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSnooze = (id, minutes = 120) => {
    setWaterTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, dueAt: new Date(Date.now() + minutes * 60 * 1000).toISOString() }
          : t
      )
    );
  };

  if (loading) return <div className="p-6 text-xl">Loading Dashboard...</div>;

  return (
    <div className="p-6 ">
      <h1 className="text-2xl font-semibold text-emerald-900 mb-4">Today’s Watering</h1>

      {waterTasks.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 p-6 text-emerald-800 bg-white">
          All caught up! 🌿
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {waterTasks.map((t) => (
            <DashboardCardWater
              key={t.id}
              plantName={t.plantName}
              spaceName={t.spaceName}
              sunlightHours={t.sunlightHours}
              dueAt={t.dueAt}
              note={t.note}
              onDone={() => handleDone(t.id)}
              onSnooze={() => handleSnooze(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
