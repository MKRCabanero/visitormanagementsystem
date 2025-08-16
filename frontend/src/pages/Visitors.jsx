import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import VisitorForm from '../components/VisitorForm';
import VisitorList from '../components/VisitorList';
import { useAuth } from '../context/AuthContext';

const Visitors = () => {
  const { user } = useAuth();

  const isVisitor = useMemo(() => {
    const role = (user?.role || user?.userType || user?.type || '').toString().toLowerCase();
    return role === 'visitor';
  }, [user]);

  const [visitors, setVisitors] = useState([]);
  const [editingVisitor, setEditingVisitor] = useState(null);

  useEffect(() => {
    // Skip fetching the list for visitor-role or when not logged in
    if (!user?.token || isVisitor) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await axiosInstance.get('/api/visitors', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!cancelled) setVisitors(response.data);
      } catch (error) {
        const status = error?.response?.status;
        // Stay quiet on auth errors; just log unexpected ones
        if (status !== 401 && status !== 403) {
          console.warn('Failed to fetch visitors.', error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isVisitor]);

  if (!user?.token) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto p-6">
      <VisitorForm
        visitors={visitors}
        setVisitors={setVisitors}           // lets admin/staff update the list immediately
        editingVisitor={editingVisitor}
        setEditingVisitor={setEditingVisitor}
        isVisitor={isVisitor}
        user={user}                         // used by the form for auth + badge ID fallback
      />
      {!isVisitor? (
        <div className="mt-6">
          <VisitorList
            visitors={visitors}
            setVisitors={setVisitors}
            setEditingVisitor={setEditingVisitor}
          />
        </div>
      ): null }
    </div>
  );
};
export default Visitors;