import React from 'react';
import AdminNavbar from './AdminNavbar';

export default function AdminDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [metrics, setMetrics] = React.useState({ usersCount: 0, driversCount: 0, onlineDrivers: 0, ridesToday: 0, groupsToday: 0, series: [] });

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await fetch('/api/admin/metrics');
        if (!res.ok) throw new Error('Failed to load metrics');
        const data = await res.json();
        if (!cancel) setMetrics(data);
      } catch (e) {
        if (!cancel) setError(e.message || 'Failed to load metrics');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6">Admin Dashboard</h1>
        {loading ? (
          <div className="text-gray-500">Loading KPIs...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card title="Users" value={metrics.usersCount} color="text-blue-700" />
              <Card title="Drivers" value={metrics.driversCount} color="text-green-700" />
              <Card title="Online Drivers" value={metrics.onlineDrivers} color="text-emerald-700" />
              <Card title="Rides Today" value={metrics.ridesToday} color="text-indigo-700" />
              <Card title="Groups Today" value={metrics.groupsToday} color="text-purple-700" />
            </div>
            <div className="bg-white border rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">Rides (last 7 days)</h2>
              </div>
              <div className="w-full overflow-x-auto">
                <div className="flex items-end gap-3 h-32">
                  {metrics.series.map((p) => (
                    <div key={p.date} className="flex flex-col items-center">
                      <div className="bg-blue-500 w-8" style={{ height: `${Math.min(100, (p.rides || 0) * 10)}%` }} />
                      <div className="text-xs mt-1 text-gray-600">{p.date.slice(5)}</div>
                    </div>
                  ))}
                  {metrics.series.length === 0 && <div className="text-gray-500 text-sm">No data</div>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="bg-white border rounded-xl shadow p-5">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
    </div>
  );
}
