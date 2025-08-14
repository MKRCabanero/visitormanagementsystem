import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const VisitorForm = ({ visitors, setVisitors, editingVisitor, setEditingVisitor }) => {
  const { user } = useAuth();
  // const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', age: '', sex: '', type: '' });

  useEffect(() => {
    if (editingVisitor) {
      setFormData({
        name: editingVisitor.name || '',
        age: editingVisitor.age || '',
        sex: editingVisitor.sex || '',
        type: editingVisitor.type || '',
      });
    } else {
      setFormData({ name: '', age: '', sex: '', type: '' });
    }
  }, [editingVisitor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVisitor) {
        const { data } = await axiosInstance.patch(
          `/api/visitors/${editingVisitor._id}`,
          formData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setVisitors(visitors.map(v => (v._id === data._id ? data : v)));
        setEditingVisitor(null);
      } else {
        const { data } = await axiosInstance.post(
          '/api/visitors',
          formData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setVisitors([...(visitors || []), data]);
        setEditingVisitor(null);
        setFormData({ name: '', age: '', sex: '', type: '' });
        ;
      }
    } catch (error) {
      alert('Failed to save visitor.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingVisitor ? 'Edit Visitor' : 'Add Visitor'}
      </h1>

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Age"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <select
        value={formData.sex}
        onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Select Sex</option>
        <option>Male</option>
        <option>Female</option>
      </select>

      <select
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Select Visitor Type</option>
        <option>By Appointment</option>
        <option>Walk-in</option>
      </select>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingVisitor ? 'Update Visitor' : 'Add Visitor'}
      </button>
    </form>
  );
};

export default VisitorForm;