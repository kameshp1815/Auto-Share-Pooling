import React from 'react';
import AdminNavbar from './AdminNavbar';

export default function GroupsList() {
  const API_BASE = import.meta.env.VITE_API_BASE || '';
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [filters, setFilters] = React.useState({ status: '', driverId: '' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.driverId) params.set('driverId', filters.driverId);
      const res = await fetch(`${API_BASE}/api/admin/groups?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load groups');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load groups');
    } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); /*eslint-disable-next-line*/ }, []);

  return (
    <>
      <AdminNavbar />
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-extrabold mb-4">Groups</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <select className="border rounded px-2 py-1" value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
            <option value="">All Status</option>
            <option value="forming">forming</option>
            <option value="assigned">assigned</option>
            <option value="enroute">enroute</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <input className="border rounded px-2 py-1" placeholder="DriverId" value={filters.driverId} onChange={e=>setFilters(f=>({...f,driverId:e.target.value}))} />
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={load}>Apply</button>
        </div>
        {loading ? (<div className="text-gray-500">Loading...</div>) : error ? (<div className="text-red-600">{error}</div>) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-3 border-b">Group</th>
                  <th className="py-2 px-3 border-b">Status</th>
                  <th className="py-2 px-3 border-b">Driver</th>
                  <th className="py-2 px-3 border-b">Members</th>
                  <th className="py-2 px-3 border-b">Distance (km)</th>
                  <th className="py-2 px-3 border-b">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(g => (
                  <tr key={g._id} className="text-sm">
                    <td className="py-2 px-3 border-b">{g.groupCode || '-'}</td>
                    <td className="py-2 px-3 border-b">{g.status}</td>
                    <td className="py-2 px-3 border-b">{g.driverId || '-'}</td>
                    <td className="py-2 px-3 border-b">{Array.isArray(g.members) ? g.members.length : 0}</td>
                    <td className="py-2 px-3 border-b">{g?.route?.distanceMeters ? (g.route.distanceMeters/1000).toFixed(1) : '-'}</td>
                    <td className="py-2 px-3 border-b">{g.createdAt ? new Date(g.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td className="py-4 px-3 text-gray-500" colSpan={6}>No groups</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
