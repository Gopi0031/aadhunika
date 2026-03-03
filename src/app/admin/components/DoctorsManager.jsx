'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Trash2, UserPlus, Building2, Stethoscope, Users,
  Loader2, IndianRupee, Pencil, Check, X, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorsManager() {
  const [activeTab, setActiveTab]   = useState('doctors');
  const [loading, setLoading]       = useState(true);

  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept]         = useState({ name: '', fee: '' });

  const [doctors, setDoctors] = useState([]);
  const [newDoc, setNewDoc]   = useState({
    name: '', phone: '', dept: '', specialization: '',
    fee: '', email: '', password: '', confirmPassword: '',
  });
  const [showPass, setShowPass]        = useState(false);
  const [showConfirm, setShowConfirm]  = useState(false);

  // Edit states
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [editDeptData, setEditDeptData]   = useState({ name: '', fee: '' });
  const [editingDocId, setEditingDocId]   = useState(null);
  const [editDocData, setEditDocData]     = useState({ name: '', phone: '', dept: '', specialization: '', fee: '', email: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, docRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/doctors'),
      ]);
      setDepartments(deptRes.ok ? await deptRes.json() : []);
      setDoctors(docRes.ok ? await docRes.json() : []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ══ DEPARTMENTS ══
  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDept.name.trim()) return toast.error('Enter department name');
    if (!newDept.fee || isNaN(newDept.fee) || Number(newDept.fee) < 0)
      return toast.error('Enter a valid fee');
    try {
      const res = await fetch('/api/departments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDept.name.trim(), fee: Number(newDept.fee) }),
      });
      if (res.ok) { await fetchData(); setNewDept({ name: '', fee: '' }); toast.success('Department added'); }
      else { const d = await res.json(); toast.error(d.error || 'Failed'); }
    } catch { toast.error('Network error'); }
  };

  const handleDeleteDept = async (deptName) => {
    if (doctors.some(d => d.dept === deptName))
      return toast.error(`Cannot delete "${deptName}" — doctors assigned`);
    if (!confirm(`Delete "${deptName}"?`)) return;
    try {
      const res = await fetch(`/api/departments?name=${encodeURIComponent(deptName)}`, { method: 'DELETE' });
      if (res.ok) { setDepartments(departments.filter(d => d.name !== deptName)); toast.success('Removed'); }
    } catch { toast.error('Delete failed'); }
  };

  const handleUpdateDept = async (id, oldName) => {
    if (!editDeptData.name.trim()) return toast.error('Name required');
    if (editDeptData.fee === '' || isNaN(editDeptData.fee)) return toast.error('Fee required');
    try {
      const res = await fetch(`/api/departments?id=${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, name: editDeptData.name.trim(), fee: Number(editDeptData.fee) }),
      });
      if (res.ok) { await fetchData(); setEditingDeptId(null); toast.success('Updated'); }
      else { const d = await res.json(); toast.error(d.error || 'Failed'); }
    } catch { toast.error('Network error'); }
  };

  // ══ DOCTORS ══
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const { name, phone, dept, specialization, fee, email, password, confirmPassword } = newDoc;
    if (!name.trim() || !dept || !email.trim() || !password)
      return toast.error('Fill all required fields');
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Enter a valid email');
    if (phone && !/^\d{10}$/.test(phone)) return toast.error('Phone must be 10 digits');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, dept, specialization, fee, email, password }),
      });
      if (res.ok) {
        await fetchData();
        setNewDoc({ name: '', phone: '', dept: '', specialization: '', fee: '', email: '', password: '', confirmPassword: '' });
        toast.success('Doctor registered successfully');
      } else { const d = await res.json(); toast.error(d.error || 'Failed'); }
    } catch { toast.error('Failed to add doctor'); }
  };

  const handleDeleteDoctor = async (id) => {
    if (!confirm('Remove this doctor?')) return;
    try {
      const res = await fetch(`/api/doctors?id=${id}`, { method: 'DELETE' });
      if (res.ok) { setDoctors(doctors.filter(d => d._id !== id)); toast.success('Removed'); }
    } catch { toast.error('Delete failed'); }
  };

  const startEditDoc = (doc) => {
    setEditingDocId(doc._id);
    setEditDocData({ name: doc.name, phone: doc.phone || '', dept: doc.dept, specialization: doc.specialization || '', fee: doc.fee ?? '', email: doc.email || '' });
  };

  const handleUpdateDoc = async (id) => {
    if (!editDocData.name.trim() || !editDocData.dept) return toast.error('Name and dept required');
    try {
      const res = await fetch(`/api/doctors?id=${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDocData),
      });
      if (res.ok) { await fetchData(); setEditingDocId(null); toast.success('Updated'); }
      else { const d = await res.json(); toast.error(d.error || 'Failed'); }
    } catch { toast.error('Network error'); }
  };

  // ── Styles ──
  const inp = {
    padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1',
    fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff',
    width: '100%', boxSizing: 'border-box',
  };
  const iconBtn = (bg, color) => ({
    background: bg, color, border: 'none', padding: 7, borderRadius: 8,
    cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s',
  });
  const label = (text, required) => (
    <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {text}{required && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: '#334155' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10, fontSize: 22 }}>
          <Stethoscope size={28} color="#0F766E" /> Hospital Management
        </h2>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #E2E8F0' }}>
        {[
          { key: 'doctors', label: 'Doctors', icon: <Users size={16} /> },
          { key: 'departments', label: 'Departments', icon: <Building2 size={16} /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 22px', border: 'none', background: 'transparent', cursor: 'pointer',
            borderBottom: activeTab === tab.key ? '3px solid #0F766E' : '3px solid transparent',
            color: activeTab === tab.key ? '#0F766E' : '#64748B',
            fontWeight: 700, fontSize: 14, marginBottom: -2,
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
          <Loader2 size={32} style={{ margin: '0 auto 10px', animation: 'spin 1s linear infinite', display: 'block' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading...
        </div>
      ) : (
        <>
          {/* ══ DOCTORS TAB ══ */}
          {activeTab === 'doctors' && (
            <div>
              {/* Registration Form */}
              <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 16, marginBottom: 28, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 15, margin: '0 0 20px', color: '#0F766E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserPlus size={18} /> Register New Doctor
                </h3>

                {departments.length === 0 ? (
                  <div style={{ padding: 15, background: '#FEF2F2', color: '#991B1B', borderRadius: 8, fontSize: 14 }}>
                    ⚠️ Add a department first before registering doctors.
                  </div>
                ) : (
                  <form onSubmit={handleAddDoctor}>
                    {/* Row 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
                      <div>
                        {label('Full Name', true)}
                        <input type="text" placeholder="Dr. Ramesh Kumar" value={newDoc.name}
                          onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} style={inp} />
                      </div>
                      <div>
                        {label('Phone Number')}
                        <input type="tel" placeholder="10-digit mobile" maxLength={10} value={newDoc.phone}
                          onChange={e => setNewDoc({ ...newDoc, phone: e.target.value })} style={inp} />
                      </div>
                      <div>
                        {label('Department', true)}
                        <select value={newDoc.dept} onChange={e => setNewDoc({ ...newDoc, dept: e.target.value })} style={inp}>
                          <option value="">Select Department</option>
                          {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
                      <div>
                        {label('Specialization')}
                        <input type="text" placeholder="e.g. Cardiac Surgeon" value={newDoc.specialization}
                          onChange={e => setNewDoc({ ...newDoc, specialization: e.target.value })} style={inp} />
                      </div>
                      <div>
                        {label('Consultation Fee (₹)')}
                        <input type="number" min="0" placeholder="e.g. 500" value={newDoc.fee}
                          onChange={e => setNewDoc({ ...newDoc, fee: e.target.value })} style={inp} />
                      </div>
                      <div>
                        {label('Email Address', true)}
                        <input type="email" placeholder="doctor@hospital.com" value={newDoc.email}
                          onChange={e => setNewDoc({ ...newDoc, email: e.target.value })} style={inp} />
                      </div>
                    </div>

                    {/* Row 3 — Passwords */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
                      <div>
                        {label('Password', true)}
                        <div style={{ position: 'relative' }}>
                          <input type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={newDoc.password}
                            onChange={e => setNewDoc({ ...newDoc, password: e.target.value })}
                            style={{ ...inp, paddingRight: 40 }} />
                          <button type="button" onClick={() => setShowPass(!showPass)}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        {label('Confirm Password', true)}
                        <div style={{ position: 'relative' }}>
                          <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={newDoc.confirmPassword}
                            onChange={e => setNewDoc({ ...newDoc, confirmPassword: e.target.value })}
                            style={{
                              ...inp, paddingRight: 40,
                              borderColor: newDoc.confirmPassword && newDoc.password !== newDoc.confirmPassword ? '#EF4444' : '#CBD5E1',
                            }} />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {newDoc.confirmPassword && newDoc.password !== newDoc.confirmPassword && (
                          <p style={{ fontSize: 11, color: '#EF4444', margin: '4px 0 0' }}>Passwords do not match</p>
                        )}
                      </div>
                    </div>

                    <button type="submit" style={{
                      background: 'linear-gradient(135deg, #0F766E, #059669)',
                      color: '#fff', border: 'none', padding: '13px 28px',
                      borderRadius: 10, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 15,
                    }}>
                      <UserPlus size={18} /> Register Doctor
                    </button>
                  </form>
                )}
              </div>

              {/* Doctor Cards */}
              {doctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>No doctors registered yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                  {doctors.map(doc => {
                    const deptInfo  = departments.find(d => d.name === doc.dept);
                    const isEditing = editingDocId === doc._id;
                    return (
                      <div key={doc._id} style={{
                        background: '#fff', padding: '18px 20px', borderRadius: 14,
                        border: `1px solid ${isEditing ? '#0F766E' : '#E2E8F0'}`,
                        boxShadow: isEditing ? '0 0 0 3px rgba(15,118,110,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                      }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>✏️ Edit Doctor</p>
                            {[
                              { key: 'name', placeholder: 'Full Name', type: 'text' },
                              { key: 'phone', placeholder: 'Phone', type: 'tel' },
                              { key: 'email', placeholder: 'Email', type: 'email' },
                              { key: 'specialization', placeholder: 'Specialization', type: 'text' },
                              { key: 'fee', placeholder: 'Fee (₹)', type: 'number' },
                            ].map(f => (
                              <input key={f.key} type={f.type} placeholder={f.placeholder} value={editDocData[f.key]}
                                onChange={e => setEditDocData({ ...editDocData, [f.key]: e.target.value })}
                                style={inp} />
                            ))}
                            <select value={editDocData.dept} onChange={e => setEditDocData({ ...editDocData, dept: e.target.value })} style={inp}>
                              <option value="">Select Department</option>
                              {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                            </select>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingDocId(null)} style={{ ...iconBtn('#F1F5F9', '#64748B'), padding: '8px 14px', gap: 6, fontWeight: 600, fontSize: 13 }}>
                                <X size={15} /> Cancel
                              </button>
                              <button onClick={() => handleUpdateDoc(doc._id)} style={{ ...iconBtn('linear-gradient(135deg,#0F766E,#059669)', '#fff'), padding: '8px 16px', gap: 6, fontWeight: 700, fontSize: 13 }}>
                                <Check size={15} /> Update
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <div style={{
                                width: 48, height: 48, borderRadius: '50%',
                                background: 'linear-gradient(135deg,#CCFBF1,#A7F3D0)',
                                color: '#0F766E', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontWeight: 800, fontSize: 20, flexShrink: 0,
                              }}>
                                {doc.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: 15, color: '#1E293B', fontWeight: 700 }}>{doc.name}</h4>
                                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748B' }}>{doc.email}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                  <span style={{ fontSize: 11, background: '#F1F5F9', color: '#64748B', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{doc.dept}</span>
                                  {doc.specialization && <span style={{ fontSize: 11, background: '#EFF6FF', color: '#3B82F6', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{doc.specialization}</span>}
                                  {doc.phone && <span style={{ fontSize: 11, background: '#F0FDF4', color: '#059669', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>📱 {doc.phone}</span>}
                                  {(doc.fee != null) && <span style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: '1px solid #A7F3D0' }}>₹{doc.fee}</span>}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => startEditDoc(doc)} style={iconBtn('#EFF6FF', '#3B82F6')} title="Edit"><Pencil size={15} /></button>
                              <button onClick={() => handleDeleteDoctor(doc._id)} style={iconBtn('#FEF2F2', '#EF4444')} title="Delete"><Trash2 size={15} /></button>
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

          {/* ══ DEPARTMENTS TAB ══ */}
          {activeTab === 'departments' && (
            <div>
              <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, marginBottom: 24, border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: 15, margin: '0 0 14px', color: '#0F766E', fontWeight: 700 }}>➕ Add New Department</h3>
                <form onSubmit={handleAddDept} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Department Name" value={newDept.name}
                    onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                    style={{ ...inp, flex: 2, minWidth: 200 }} />
                  <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 15, fontWeight: 600, pointerEvents: 'none' }}>₹</span>
                    <input type="number" min="0" placeholder="Consultation Fee" value={newDept.fee}
                      onChange={e => setNewDept({ ...newDept, fee: e.target.value })}
                      style={{ ...inp, paddingLeft: 28 }} />
                  </div>
                  <button type="submit" style={{ background: 'linear-gradient(135deg,#0F766E,#059669)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={17} /> Add
                  </button>
                </form>
              </div>

              {departments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>No departments yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {departments.map(dept => {
                    const isEditing = editingDeptId === dept._id;
                    return (
                      <div key={dept._id} style={{ background: '#fff', padding: '16px 18px', borderRadius: 14, border: `1px solid ${isEditing ? '#0F766E' : '#E2E8F0'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#0F766E', textTransform: 'uppercase' }}>✏️ Edit Department</p>
                            <input type="text" value={editDeptData.name} onChange={e => setEditDeptData({ ...editDeptData, name: e.target.value })} style={inp} />
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 15, pointerEvents: 'none' }}>₹</span>
                              <input type="number" min="0" value={editDeptData.fee} onChange={e => setEditDeptData({ ...editDeptData, fee: e.target.value })} style={{ ...inp, paddingLeft: 28 }} />
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingDeptId(null)} style={{ ...iconBtn('#F1F5F9', '#64748B'), padding: '8px 14px', gap: 6, fontSize: 13, fontWeight: 600 }}><X size={15} /> Cancel</button>
                              <button onClick={() => handleUpdateDept(dept._id, dept.name)} style={{ ...iconBtn('linear-gradient(135deg,#0F766E,#059669)', '#fff'), padding: '8px 16px', gap: 6, fontSize: 13, fontWeight: 700 }}><Check size={15} /> Update</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={20} color="#3B82F6" />
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#1E293B', fontSize: 15 }}>{dept.name}</p>
                                <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <IndianRupee size={12} />{dept.fee != null ? `${dept.fee} consultation fee` : 'Fee not set'}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => { setEditingDeptId(dept._id); setEditDeptData({ name: dept.name, fee: dept.fee ?? '' }); }} style={iconBtn('#EFF6FF', '#3B82F6')}><Pencil size={16} /></button>
                              <button onClick={() => handleDeleteDept(dept.name)} style={iconBtn('#FEF2F2', '#EF4444')}><Trash2 size={16} /></button>
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
