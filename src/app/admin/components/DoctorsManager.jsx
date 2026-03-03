// src/app/admin/components/DoctorsManager.jsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus, Building2, Stethoscope, Users, Loader2, IndianRupee, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorsManager() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState({ name: '', fee: '' });

  const [doctors, setDoctors] = useState([]);
  const [newDoc, setNewDoc] = useState({ name: '', dept: '' });

  // ── Edit states ──
  const [editingDeptId, setEditingDeptId]   = useState(null);
  const [editDeptData, setEditDeptData]     = useState({ name: '', fee: '' });
  const [editingDocId, setEditingDocId]     = useState(null);
  const [editDocData, setEditDocData]       = useState({ name: '', dept: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, docRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/doctors'),
      ]);
      const deptData = deptRes.ok ? await deptRes.json() : [];
      const docData  = docRes.ok  ? await docRes.json()  : [];
      setDepartments(deptData);
      setDoctors(docData);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════
  // DEPARTMENTS
  // ══════════════════════════════
  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return toast.error('Enter department name');
    if (!newDept.fee || isNaN(newDept.fee) || Number(newDept.fee) < 0)
      return toast.error('Enter a valid consultation fee');

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDept.name.trim(), fee: Number(newDept.fee) }),
      });
      if (res.ok) {
        await fetchData();
        setNewDept({ name: '', fee: '' });
        toast.success('Department added');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleDeleteDept = async (deptName) => {
    const hasDoctors = doctors.some(doc => doc.dept === deptName);
    if (hasDoctors) return toast.error(`Cannot delete "${deptName}" — doctors assigned to it`);
    if (!confirm(`Delete department "${deptName}"?`)) return;

    try {
      const res = await fetch(`/api/departments?name=${encodeURIComponent(deptName)}`, { method: 'DELETE' });
      if (res.ok) {
        setDepartments(departments.filter(d => d.name !== deptName));
        toast.success('Department removed');
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const startEditDept = (dept) => {
    setEditingDeptId(dept._id);
    setEditDeptData({ name: dept.name, fee: dept.fee ?? '' });
  };

  const cancelEditDept = () => {
    setEditingDeptId(null);
    setEditDeptData({ name: '', fee: '' });
  };

  const handleUpdateDept = async (deptId, oldName) => {
    if (!editDeptData.name.trim()) return toast.error('Name cannot be empty');
    if (editDeptData.fee === '' || isNaN(editDeptData.fee) || Number(editDeptData.fee) < 0)
      return toast.error('Enter a valid fee');

    try {
      const res = await fetch(`/api/departments?id=${deptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldName,
          name: editDeptData.name.trim(),
          fee: Number(editDeptData.fee),
        }),
      });
      if (res.ok) {
        await fetchData();
        cancelEditDept();
        toast.success('Department updated');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Update failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // ══════════════════════════════
  // DOCTORS
  // ══════════════════════════════
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
        await fetchData();
        setNewDoc({ name: '', dept: '' });
        toast.success('Doctor added successfully');
      }
    } catch {
      toast.error('Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!confirm('Remove this doctor?')) return;
    try {
      const res = await fetch(`/api/doctors?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDoctors(doctors.filter(doc => doc._id !== id));
        toast.success('Doctor removed');
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const startEditDoc = (doc) => {
    setEditingDocId(doc._id);
    setEditDocData({ name: doc.name, dept: doc.dept });
  };

  const cancelEditDoc = () => {
    setEditingDocId(null);
    setEditDocData({ name: '', dept: '' });
  };

  const handleUpdateDoc = async (docId) => {
    if (!editDocData.name.trim()) return toast.error('Name cannot be empty');
    if (!editDocData.dept)        return toast.error('Select a department');

    try {
      const res = await fetch(`/api/doctors?id=${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editDocData.name.trim(),
          dept: editDocData.dept,
        }),
      });
      if (res.ok) {
        await fetchData();
        cancelEditDoc();
        toast.success('Doctor updated');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Update failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // ── Shared styles ──
  const inputStyle = {
    padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #CBD5E1', fontSize: '14px',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.2s ease', background: '#fff',
  };

  const iconBtn = (bg, color) => ({
    background: bg, color, border: 'none',
    padding: 7, borderRadius: 8, cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: '#334155' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10, fontSize: 22 }}>
          <Stethoscope size={28} color="#0F766E" />
          Hospital Management
        </h2>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #E2E8F0' }}>
        {[
          { key: 'doctors',     label: 'Doctors',    icon: <Users size={16} /> },
          { key: 'departments', label: 'Departments', icon: <Building2 size={16} /> },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 22px', border: 'none', background: 'transparent', cursor: 'pointer',
            borderBottom: activeTab === tab.key ? '3px solid #0F766E' : '3px solid transparent',
            color: activeTab === tab.key ? '#0F766E' : '#64748B',
            fontWeight: 700, fontSize: 14, marginBottom: -2,
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s ease',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
          <Loader2 size={32} style={{ margin: '0 auto 10px', animation: 'spin 1s linear infinite', display: 'block' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading data...
        </div>
      ) : (
        <>
          {/* ══════════════════════════════
               DOCTORS TAB
          ══════════════════════════════ */}
          {activeTab === 'doctors' && (
            <div>
              {/* Add Doctor Form */}
              <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, marginBottom: 24, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 15, margin: '0 0 14px', color: '#0F766E', fontWeight: 700 }}>
                  ➕ Add New Specialist
                </h3>
                {departments.length === 0 ? (
                  <div style={{ padding: 15, background: '#FEF2F2', color: '#991B1B', borderRadius: 8, fontSize: 14 }}>
                    ⚠️ No departments found. Please add a Department first.
                  </div>
                ) : (
                  <form onSubmit={handleAddDoctor} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Doctor Name (e.g. Dr. Sharma)"
                      value={newDoc.name}
                      onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                      style={{ ...inputStyle, flex: 1, minWidth: 200 }}
                    />
                    <select
                      value={newDoc.dept}
                      onChange={(e) => setNewDoc({ ...newDoc, dept: e.target.value })}
                      style={{ ...inputStyle, minWidth: 200 }}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                    <button type="submit" style={{
                      background: 'linear-gradient(135deg, #0F766E, #059669)',
                      color: '#fff', border: 'none', padding: '12px 24px',
                      borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 14,
                    }}>
                      <UserPlus size={17} /> Add Doctor
                    </button>
                  </form>
                )}
              </div>

              {/* Doctor Cards */}
              {doctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: 15 }}>
                  No doctors added yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                  {doctors.map((doc) => {
                    const deptInfo  = departments.find(d => d.name === doc.dept);
                    const isEditing = editingDocId === doc._id;
                    return (
                      <div key={doc._id} style={{
                        background: '#fff', padding: '16px 18px', borderRadius: 14,
                        border: `1px solid ${isEditing ? '#0F766E' : '#E2E8F0'}`,
                        boxShadow: isEditing ? '0 0 0 3px rgba(15,118,110,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                      }}>
                        {isEditing ? (
                          /* ── EDIT MODE ── */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              ✏️ Editing Doctor
                            </p>
                            <input
                              type="text"
                              value={editDocData.name}
                              onChange={(e) => setEditDocData({ ...editDocData, name: e.target.value })}
                              placeholder="Doctor Name"
                              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                            />
                            <select
                              value={editDocData.dept}
                              onChange={(e) => setEditDocData({ ...editDocData, dept: e.target.value })}
                              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                            >
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept._id} value={dept.name}>{dept.name}</option>
                              ))}
                            </select>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button onClick={cancelEditDoc} style={{
                                ...iconBtn('#F1F5F9', '#64748B'),
                                padding: '8px 14px', gap: 6, fontWeight: 600, fontSize: 13,
                              }}>
                                <X size={15} /> Cancel
                              </button>
                              <button onClick={() => handleUpdateDoc(doc._id)} style={{
                                ...iconBtn('linear-gradient(135deg, #0F766E, #059669)', '#fff'),
                                padding: '8px 16px', gap: 6, fontWeight: 700, fontSize: 13,
                              }}>
                                <Check size={15} /> Update
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── VIEW MODE ── */
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 46, height: 46,
                                background: 'linear-gradient(135deg, #CCFBF1, #A7F3D0)',
                                color: '#0F766E', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: 18, flexShrink: 0,
                              }}>
                                {doc.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: 15, color: '#1E293B', fontWeight: 700 }}>
                                  {doc.name}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <span style={{
                                    fontSize: 12, color: '#64748B', background: '#F1F5F9',
                                    padding: '2px 10px', borderRadius: 20, fontWeight: 600,
                                  }}>
                                    {doc.dept}
                                  </span>
                                  {deptInfo?.fee != null && (
                                    <span style={{
                                      fontSize: 12, color: '#059669', background: '#ECFDF5',
                                      padding: '2px 10px', borderRadius: 20, fontWeight: 700,
                                      border: '1px solid #A7F3D0',
                                      display: 'flex', alignItems: 'center', gap: 3,
                                    }}>
                                      ₹{deptInfo.fee}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => startEditDoc(doc)} style={iconBtn('#EFF6FF', '#3B82F6')} title="Edit doctor">
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => handleDeleteDoctor(doc._id)} style={iconBtn('#FEF2F2', '#EF4444')} title="Remove doctor">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════
               DEPARTMENTS TAB
          ══════════════════════════════ */}
          {activeTab === 'departments' && (
            <div>
              {/* Add Department Form */}
              <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, marginBottom: 24, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 15, margin: '0 0 14px', color: '#0F766E', fontWeight: 700 }}>
                  ➕ Add New Department
                </h3>
                <form onSubmit={handleAddDept} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Department Name (e.g. Dermatology)"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    style={{ ...inputStyle, flex: 2, minWidth: 200 }}
                  />
                  <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      color: '#64748B', fontSize: 15, fontWeight: 600, pointerEvents: 'none',
                    }}>₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Consultation Fee"
                      value={newDept.fee}
                      onChange={(e) => setNewDept({ ...newDept, fee: e.target.value })}
                      style={{ ...inputStyle, width: '100%', paddingLeft: 28, boxSizing: 'border-box' }}
                    />
                  </div>
                  <button type="submit" style={{
                    background: 'linear-gradient(135deg, #0F766E, #059669)',
                    color: '#fff', border: 'none', padding: '12px 24px',
                    borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 14,
                  }}>
                    <Plus size={17} /> Add
                  </button>
                </form>
              </div>

              {/* Department Cards */}
              {departments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: 15 }}>
                  No departments added yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {departments.map((dept) => {
                    const isEditing = editingDeptId === dept._id;
                    return (
                      <div key={dept._id} style={{
                        background: '#fff', padding: '16px 18px', borderRadius: 14,
                        border: `1px solid ${isEditing ? '#0F766E' : '#E2E8F0'}`,
                        boxShadow: isEditing ? '0 0 0 3px rgba(15,118,110,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                      }}>
                        {isEditing ? (
                          /* ── EDIT MODE ── */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              ✏️ Editing Department
                            </p>
                            <input
                              type="text"
                              value={editDeptData.name}
                              onChange={(e) => setEditDeptData({ ...editDeptData, name: e.target.value })}
                              placeholder="Department Name"
                              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                            />
                            <div style={{ position: 'relative' }}>
                              <span style={{
                                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                color: '#64748B', fontSize: 15, fontWeight: 600, pointerEvents: 'none',
                              }}>₹</span>
                              <input
                                type="number"
                                min="0"
                                value={editDeptData.fee}
                                onChange={(e) => setEditDeptData({ ...editDeptData, fee: e.target.value })}
                                placeholder="Consultation Fee"
                                style={{ ...inputStyle, width: '100%', paddingLeft: 28, boxSizing: 'border-box' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button onClick={cancelEditDept} style={{
                                ...iconBtn('#F1F5F9', '#64748B'),
                                padding: '8px 14px', gap: 6, fontWeight: 600, fontSize: 13,
                              }}>
                                <X size={15} /> Cancel
                              </button>
                              <button onClick={() => handleUpdateDept(dept._id, dept.name)} style={{
                                ...iconBtn('linear-gradient(135deg, #0F766E, #059669)', '#fff'),
                                padding: '8px 16px', gap: 6, fontWeight: 700, fontSize: 13,
                              }}>
                                <Check size={15} /> Update
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── VIEW MODE ── */
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Building2 size={20} color="#3B82F6" />
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: 15 }}>
                                  {dept.name}
                                </p>
                                <p style={{
                                  margin: '3px 0 0', fontSize: 13, fontWeight: 700,
                                  color: '#059669', display: 'flex', alignItems: 'center', gap: 3,
                                }}>
                                  <IndianRupee size={12} />
                                  {dept.fee != null ? `${dept.fee} consultation fee` : 'Fee not set'}
                                </p>
                              </div>
                            </div>
                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => startEditDept(dept)} style={iconBtn('#EFF6FF', '#3B82F6')} title="Edit department">
                                <Pencil size={16} />
                              </button>
                              <button onClick={() => handleDeleteDept(dept.name)} style={iconBtn('#FEF2F2', '#EF4444')} title="Delete department">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
