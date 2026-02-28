'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Building2, Stethoscope, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorsManager() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [loading, setLoading] = useState(true);

  // --- STATE ---
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  
  const [doctors, setDoctors] = useState([]);
  const [newDoc, setNewDoc] = useState({ name: '', dept: '' });

  // --- LOAD DATA ON MOUNT ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, docRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/doctors')
      ]);

      if (deptRes.ok) setDepartments(await deptRes.json());
      if (docRes.ok) setDoctors(await docRes.json());
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // HANDLERS: DEPARTMENTS
  // ==========================
  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return toast.error('Enter department name');

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDeptName.trim() }),
      });

      if (res.ok) {
        // Refresh data to get the new ID from DB
        await fetchData();
        setNewDeptName('');
        toast.success('Department added');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleDeleteDept = async (deptName) => {
    // Check if doctors are using this department
    const hasDoctors = doctors.some(doc => doc.dept === deptName);
    if (hasDoctors) {
      return toast.error(`Cannot delete ${deptName} while doctors are assigned to it.`);
    }

    if(!confirm(`Delete ${deptName}?`)) return;

    try {
      const res = await fetch(`/api/departments?name=${encodeURIComponent(deptName)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDepartments(departments.filter(d => d.name !== deptName));
        toast.success('Department removed');
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // ==========================
  // HANDLERS: DOCTORS
  // ==========================
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.dept) return toast.error('Fill all fields');

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });

      if (res.ok) {
        fetchData();
        setNewDoc({ name: '', dept: '' });
        toast.success('Doctor added successfully');
      }
    } catch (err) {
      toast.error('Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if(!confirm('Remove this doctor?')) return;

    try {
      const res = await fetch(`/api/doctors?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDoctors(doctors.filter(doc => doc._id !== id));
        toast.success('Doctor removed');
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="doctors-manager" style={{ fontFamily: 'sans-serif', color: '#334155' }}>
      
      {/* HEADER */}
      <div className="list-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Stethoscope size={28} color="#0F766E" />
          Hospital Management
        </h2>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '1px' }}>
        <button
          onClick={() => setActiveTab('doctors')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'doctors' ? '3px solid #0F766E' : '3px solid transparent',
            color: activeTab === 'doctors' ? '#0F766E' : '#64748B',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Users size={18} /> Doctors
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'departments' ? '3px solid #0F766E' : '3px solid transparent',
            color: activeTab === 'departments' ? '#0F766E' : '#64748B',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Building2 size={18} /> Departments
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          <Loader2 className="animate-spin" style={{ margin: '0 auto 10px' }} />
          Loading data...
        </div>
      ) : (
        <div className="tab-content">
          
          {/* === DOCTORS TAB === */}
          {activeTab === 'doctors' && (
            <div className="animate-fade-in">
              <div className="card" style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 15px', color: '#0F766E', fontWeight: '700' }}>Add New Specialist</h3>
                
                {departments.length === 0 ? (
                  <div style={{ padding: '15px', background: '#FEF2F2', color: '#991B1B', borderRadius: '8px', fontSize: '14px' }}>
                    ⚠️ No departments found. Please add a Department first.
                  </div>
                ) : (
                  <form onSubmit={handleAddDoctor} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="Doctor Name (e.g. Dr. Smith)" 
                      value={newDoc.name}
                      onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', minWidth: '200px' }}
                    />
                    <select 
                      value={newDoc.dept}
                      onChange={(e) => setNewDoc({...newDoc, dept: e.target.value})}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', minWidth: '200px', background: 'white' }}
                    >
                      <option value="">Select Department</option>
                      {/* UPDATED: Map over objects */}
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                    <button type="submit" style={{ background: '#0F766E', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserPlus size={18} /> Add
                    </button>
                  </form>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {doctors.map((doc) => (
                  <div key={doc._id} style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '45px', height: '45px', background: '#CCFBF1', color: '#0F766E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                        {doc.name.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#1E293B' }}>{doc.name}</h4>
                        <span style={{ fontSize: '12px', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '12px' }}>
                          {doc.dept}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteDoctor(doc._id)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === DEPARTMENTS TAB === */}
          {activeTab === 'departments' && (
            <div className="animate-fade-in">
              <div className="card" style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
                 <h3 style={{ fontSize: '16px', margin: '0 0 15px', color: '#0F766E', fontWeight: '700' }}>Add New Department</h3>
                 <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Department Name (e.g. Dermatology)" 
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                    <button type="submit" style={{ background: '#0F766E', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Plus size={18} /> Add
                    </button>
                 </form>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {/* UPDATED: Map over objects */}
                {departments.map((dept) => (
                  <div key={dept._id} style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Building2 size={20} color="#64748B" />
                        <span style={{ fontWeight: '600', color: '#334155' }}>{dept.name}</span>
                     </div>
                     <button onClick={() => handleDeleteDept(dept.name)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                     </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}