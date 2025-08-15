import { useLocation, Navigate, Link } from 'react-router-dom';

export default function Badge() {
  const { state } = useLocation();
  const rec = state?.record || null;
  const userId = state?.userId || null;

  // If someone opens /badge directly with no state, send them back
  if (!rec) return <Navigate to="/visitors" replace />;

  const badgeId = rec.badgeId || rec._id || userId || 'N/A';

  return (
    <div className="w-1/2 md:w-full ...">
      <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-8 ring shadow-xl ring-gray-900/5">
        <h1 className="text-xl font-semibold mb-3">Visitor information recorded</h1>

        <dl className="list-none md:list-disc ...">
          <div className="flex">
            <dt className="w-32 font-medium">Name:</dt>
            <dd className="flex-1">{rec.name || '—'}</dd>
          </div>
          <div className="flex">
            <dt className="w-32 font-medium">Age:</dt>
            <dd className="flex-1">{rec.age || '—'}</dd>
          </div>
          <div className="flex">
            <dt className="w-32 font-medium">Sex:</dt>
            <dd className="flex-1">{rec.sex || '—'}</dd>
          </div>
          <div className="flex">
            <dt className="w-32 font-medium">Type:</dt>
            <dd className="flex-1">{rec.type || '—'}</dd>
          </div>
          <div className="flex">
            <dt className="w-32 font-medium">Badge ID:</dt>
            <dd className="flex-1">{badgeId}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4">
        <Link to="/visitors" className="px-3 py-1 rounded border">
          Back
        </Link>
      </div>
    </div>
  );
}