import React from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function RidesList() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [filters, setFilters] = React.useState({ status: '', driver: '', dateFrom: '', dateTo: '' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.driver) params.set('driver', filters.driver);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      const res = await fetch(`${API_BASE}/api/admin/rides?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load rides');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load rides');
    } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); /*eslint-disable-next-line*/ }, []);

  return (
    <>
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-extrabold mb-4">Rides</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <select className="border rounded px-2 py-1" value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
            <option value="">All Status</option>
            <option value="Requested">Requested</option>
            <option value="Accepted">Accepted</option>
            <option value="Arrived">Arrived</option>
            <option value="Started">Started</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input className="border rounded px-2 py-1" placeholder="Driver email" value={filters.driver} onChange={e=>setFilters(f=>({...f,driver:e.target.value}))} />
          <input className="border rounded px-2 py-1" type="date" value={filters.dateFrom} onChange={e=>setFilters(f=>({...f,dateFrom:e.target.value}))} />
          <input className="border rounded px-2 py-1" type="date" value={filters.dateTo} onChange={e=>setFilters(f=>({...f,dateTo:e.target.value}))} />
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={load}>Apply</button>
        </div>
        {loading ? (<div className="text-gray-500">Loading...</div>) : error ? (<div className="text-red-600">{error}</div>) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-3 border-b">From → To</th>
                  <th className="py-2 px-3 border-b">User</th>
                  <th className="py-2 px-3 border-b">Driver</th>
                  <th className="py-2 px-3 border-b">Vehicle</th>
                  <th className="py-2 px-3 border-b">Status</th>
                  <th className="py-2 px-3 border-b">Payment</th>
                  <th className="py-2 px-3 border-b">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r._id} className="text-sm">
                    <td className="py-2 px-3 border-b">{r.from} → {r.to}</td>
                    <td className="py-2 px-3 border-b">{r.email || '-'}</td>
                    <td className="py-2 px-3 border-b">{r.driver || '-'}</td>
                    <td className="py-2 px-3 border-b">{r.vehicle || '-'}</td>
                    <td className="py-2 px-3 border-b">{r.status || '-'}</td>
                    <td className="py-2 px-3 border-b">{r.paymentStatus || '-'}</td>
                    <td className="py-2 px-3 border-b">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td className="py-4 px-3 text-gray-500" colSpan={7}>No rides</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
