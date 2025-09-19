import React, { useEffect, useMemo, useState } from "react";
import AdminNavbar from "./AdminNavbar";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/auth/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data.filter(u => (u?.type || 'user') !== 'driver') : []);
      } catch (err) {
        setError(err.message || "Error fetching users");
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data.filter(u => (u?.type || 'user') !== 'driver') : []);
    } catch (err) {
      setError(err.message || "Error fetching users");
    }
    setLoading(false);
  };

  const getDisplayName = (u) => {
    if (u?.name && u.name.trim()) return u.name;
    const email = u?.email || '';
    const prefix = email.split('@')[0] || '';
    if (!prefix) return '-';
    return prefix
      .split(/[._-]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, email, or phone"
              className="w-72 max-w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button onClick={refresh} className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200">Refresh</button>
          </div>
        </div>
        <div className="text-sm text-gray-600 mb-2">Showing {visible.length} of {filtered.length} users</div>
        {loading ? (
          <div className="text-center text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Phone</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(user => (
                  <tr key={user._id} className="text-center">
                    <td className="py-2 px-4 border-b">{getDisplayName(user)}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">{user.phone || "-"}</td>
                    <td className={`py-2 px-4 border-b font-semibold text-green-600`}>Active</td>
                    <td className="py-2 px-4 border-b flex gap-2 justify-center">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">View</button>
                      <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Ban</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >Prev</button>
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 