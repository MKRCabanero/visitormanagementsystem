import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

export default function VisitorList({ visitors = [], setVisitors, setEditingVisitor }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—');

  const userIdOf = (v) =>
    (v.userId && (v.userId._id || v.userId)) || v.createdBy || '—';

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this visitor?')) return;
    await axiosInstance.delete(`/api/visitors/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setVisitors?.((prev) => prev.filter((v) => v._id !== id));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[820px] w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3 border-b">Name</th>
            <th className="text-left p-3 border-b">Age</th>
            <th className="text-left p-3 border-b">Sex</th>
            <th className="text-left p-3 border-b">Type</th>
            <th className="text-left p-3 border-b">Created</th>
            <th className="text-left p-3 border-b w-[240px]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {visitors.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-3 text-sm text-gray-600">
                No visitors yet.
              </td>
            </tr>
          ) : (
            visitors.map((v) => (
              <tr key={v._id} className="odd:bg-white even:bg-gray-50">
                <td className="p-3 border-b">{v.name || '—'}</td>
                <td className="p-3 border-b">{v.age || '—'}</td>
                <td className="p-3 border-b">{v.sex || '—'}</td>
                <td className="p-3 border-b">{v.type || '—'}</td>
                <td className="p-3 border-b">{fmtDate(v.createdAt)}</td>
                <td className="p-3 border-b">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setEditingVisitor?.(v)} className="bg-red-500 text-white px-3 py-2 rounded">
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        navigate('/badge', { state: { record: v, userId: userIdOf(v) } })
                      }
                      className="bg-red-500 text-white px-3 py-2 rounded"
                    >
                      Badge
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="bg-red-500 text-white px-3 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}