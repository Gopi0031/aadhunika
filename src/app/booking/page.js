// src/app/booking/page.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/navigation';

// =============================================
// TIME UTILITY FUNCTIONS
// =============================================
const timeToMinutes = (timeStr) => {
  try {
    if (!timeStr) return -1;
    const startPart = timeStr.split(/-|–/)[0].trim().toLowerCase();
    const match = startPart.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
    if (!match) return -1;
    const [, hoursStr, minutesStr, period] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  } catch {
    return -1;
  }
};

const isSlotInPast = (slotTime, selectedDateString) => {
  const now = new Date();
  if (!selectedDateString) return false;
  const [year, month, day] = selectedDateString.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (selectedDate > todayReset) return false;
  if (selectedDate < todayReset) return true;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotStartMinutes = timeToMinutes(slotTime);
  if (slotStartMinutes === -1) return false;
  return slotStartMinutes < currentMinutes;
};

const filterAvailableSlots = (slots, selectedDateString) => {
  if (!Array.isArray(slots)) return [];
  return slots.filter((slot) => {
    if (slot.status === 'booked' || slot.status === 'closed') return true;
    return !isSlotInPast(slot.time, selectedDateString);
  });
};

const getFormattedDate = (dateObj) => dateObj.toLocaleDateString('en-CA');

// =============================================
// CONSULTATION FEES
// =============================================
const CONSULTATION_FEES = { Online: 5, Offline: 0 };

// =============================================
// STEP INDICATOR COMPONENT
// =============================================
function StepIndicator({ currentStep }) {
  const steps = [
    { label: 'Patient Info', icon: '👤' },
    { label: 'Department & Date', icon: '🏥' },
    { label: 'Time Slot', icon: '⏰' },
    { label: 'Confirm', icon: '✅' },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 0, marginBottom: 36, flexWrap: 'nowrap', overflowX: 'auto',
      padding: '0 4px',
    }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 6, minWidth: 70,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: currentStep > i
                ? 'linear-gradient(135deg, #059669, #0F766E)'
                : currentStep === i + 1
                  ? 'linear-gradient(135deg, #0F766E, #059669)'
                  : '#F1F5F9',
              color: currentStep >= i + 1 ? '#fff' : '#94A3B8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: currentStep > i ? 18 : 16,
              fontWeight: 700,
              transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: currentStep >= i + 1
                ? '0 4px 16px rgba(15,118,110,0.35)'
                : '0 2px 6px rgba(0,0,0,0.06)',
              transform: currentStep === i + 1 ? 'scale(1.1)' : 'scale(1)',
            }}>
              {currentStep > i ? '✓' : step.icon}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, textAlign: 'center',
              color: currentStep >= i + 1 ? '#0F766E' : '#94A3B8',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              transition: 'color 0.3s ease', whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 'clamp(20px, 4vw, 50px)', height: 3,
              background: currentStep > i + 1
                ? 'linear-gradient(90deg, #059669, #0F766E)'
                : '#E2E8F0',
              borderRadius: 2, marginBottom: 22,
              transition: 'background 0.5s ease', flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================
// FORM INPUT WRAPPER COMPONENT
// =============================================
function FormInput({ label, required, children, icon }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 700, color: '#374151',
        marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {icon && <span>{icon}</span>}
        {label}
        {required && <span style={{ color: '#ef4444', fontSize: 14 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// =============================================
// SLOT BUTTON COMPONENT
// =============================================
function SlotButton({ slot, isSelected, isUnavailable, isPast, isBooked, isClosed, onClick }) {
  const [hovered, setHovered] = useState(false);

  const getBg = () => {
    if (isSelected) return 'linear-gradient(135deg, #059669, #0F766E)';
    if (isUnavailable) return '#F8FAFC';
    if (hovered) return 'linear-gradient(135deg, rgba(15,118,110,0.08), rgba(5,150,105,0.05))';
    return '#fff';
  };

  const getBorderColor = () => {
    if (isSelected) return '#059669';
    if (isUnavailable) return '#E2E8F0';
    if (hovered) return '#0F766E';
    return '#E5E7EB';
  };

  const getColor = () => {
    if (isSelected) return '#fff';
    if (isUnavailable) return '#CBD5E1';
    if (hovered) return '#0F766E';
    return '#374151';
  };

  const getLabel = () => {
    if (isBooked) return '🔴 Booked';
    if (isClosed) return '🚫 Closed';
    if (isPast) return '⏰ Past';
    if (isSelected) return '✓ Selected';
    return '✓ Available';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isUnavailable}
      onMouseEnter={() => !isUnavailable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: 12,
        borderWidth: 2, borderStyle: 'solid',
        borderColor: getBorderColor(),
        background: getBg(),
        cursor: isUnavailable ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8, fontFamily: 'inherit',
        transform: isSelected
          ? 'scale(1.02)'
          : hovered && !isUnavailable
            ? 'translateX(4px)'
            : 'scale(1)',
        boxShadow: isSelected
          ? '0 6px 20px rgba(5,150,105,0.35)'
          : hovered && !isUnavailable
            ? '0 4px 14px rgba(15,118,110,0.15)'
            : '0 1px 4px rgba(0,0,0,0.04)',
        opacity: isUnavailable && !isBooked && !isClosed ? 0.55 : 1,
        transition: 'all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: getColor() }}>
        🕐 {slot.time}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 700,
        color: isSelected
          ? 'rgba(255,255,255,0.9)'
          : isUnavailable ? '#94A3B8'
            : hovered ? '#0F766E' : '#94A3B8',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        background: isSelected
          ? 'rgba(255,255,255,0.2)'
          : isUnavailable ? '#F1F5F9'
            : hovered ? 'rgba(15,118,110,0.1)' : '#F8FAFC',
        padding: '3px 8px', borderRadius: 20,
        transition: 'all 0.25s ease',
      }}>
        {getLabel()}
      </span>
    </button>
  );
}

// =============================================
// INFO PANEL COMPONENT
// =============================================
function InfoPanel({ appointmentType, formData }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: '👤',
      text: 'Fill patient information',
      done: !!(formData.name && formData.email && formData.phone),
    },
    {
      icon: '🏥',
      text: 'Select department',
      done: !!formData.department,
    },
    {
      icon: '📅',
      text: 'Choose date & time slot',
      done: !!(formData.date && formData.time),
    },
    ...(appointmentType === 'Online'
      ? [
          { icon: '💳', text: `Pay ₹${CONSULTATION_FEES.Online} via UPI / Card`, done: false },
          { icon: '📹', text: 'Receive Zoom meeting link', done: false },
        ]
      : []),
    { icon: '✅', text: 'Get confirmation email', done: false },
  ];

  const upiApps = [
    { name: 'Google Pay', emoji: '🟢' },
    { name: 'PhonePe', emoji: '🟣' },
    { name: 'Paytm', emoji: '🔵' },
    { name: 'BHIM UPI', emoji: '🟠' },
    { name: 'Amazon Pay', emoji: '🟡' },
    { name: 'CRED', emoji: '⚫' },
    { name: 'WhatsApp Pay', emoji: '🟢' },
    { name: 'Any UPI App', emoji: '📱' },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: 'sticky', top: 100,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateX(40px)',
        transition: 'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.2s',
      }}
    >
      {/* Process Steps */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDFA, #ECFDF5)',
        borderRadius: 20, padding: 'clamp(20px,3vw,28px)',
        borderWidth: 1, borderStyle: 'solid', borderColor: '#CCFBF1',
        marginBottom: 20,
        boxShadow: '0 4px 20px rgba(15,118,110,0.1)',
      }}>
        <h2 style={{
          fontSize: 18, fontWeight: 800, color: '#0F766E',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          🩺 Booking Process
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: step.done ? 'rgba(5,150,105,0.1)' : 'rgba(255,255,255,0.7)',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: step.done ? 'rgba(5,150,105,0.25)' : 'rgba(255,255,255,0.9)',
                transition: 'all 0.4s ease',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(20px)',
                transitionDelay: `${i * 0.08 + 0.3}s`,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: step.done
                  ? 'linear-gradient(135deg, #059669, #0F766E)'
                  : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: step.done ? 16 : 18, flexShrink: 0,
                boxShadow: step.done
                  ? '0 4px 12px rgba(5,150,105,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.07)',
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                {step.done ? '✓' : step.icon}
              </div>
              <span style={{
                fontSize: 14,
                fontWeight: step.done ? 700 : 500,
                color: step.done ? '#065F46' : '#374151',
                transition: 'all 0.3s ease',
              }}>
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Notice */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)',
        borderRadius: 16, padding: '18px 20px',
        borderWidth: 1, borderStyle: 'solid', borderColor: '#FED7AA',
        marginBottom: 20,
        boxShadow: '0 4px 16px rgba(249,115,22,0.1)',
      }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#C2410C', marginBottom: 6 }}>
          🚨 Emergency?
        </p>
        <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6, margin: '0 0 10px' }}>
          For medical emergencies, please call us directly.
        </p>
        <a
          href="tel:+916305650469"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #C2410C, #EA580C)',
            color: '#fff', padding: '10px 18px', borderRadius: 10,
            fontWeight: 700, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(194,65,12,0.35)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(194,65,12,0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(194,65,12,0.35)';
          }}
        >
          📞 +91 9492121131
        </a>
      </div>

      {/* UPI Apps (Online only) */}
      {appointmentType === 'Online' && (
        <div style={{
          background: '#fff', borderRadius: 16, padding: '18px 20px',
          borderWidth: 1, borderStyle: 'solid', borderColor: '#E2E8F0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <p style={{
            fontWeight: 800, fontSize: 14, color: '#166534',
            margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            📲 Supported Payment Apps
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          }}>
            {upiApps.map((app) => (
              <div
                key={app.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 12, color: '#374151', fontWeight: 600,
                  padding: '6px 10px', borderRadius: 8, background: '#F8FAFC',
                  borderWidth: 1, borderStyle: 'solid', borderColor: '#E2E8F0',
                }}
              >
                <span>{app.emoji}</span>
                <span>{app.name}</span>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: 11, color: '#9CA3AF', marginTop: 12,
            textAlign: 'center', lineHeight: 1.5,
          }}>
            🔒 Secured by Razorpay | 256-bit SSL | PCI DSS Compliant
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================
// MAIN BOOKING PAGE
// =============================================
export default function BookingPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [departmentList, setDepartmentList] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    appointmentType: 'Offline', department: '',
    date: '', time: '', message: '',
    file: null, fileBase64: '', fileName: '', fileType: '',
  });

  // ── Step progress tracking ──
  useEffect(() => {
    if (formData.time) setCurrentStep(4);
    else if (formData.department && formData.date) setCurrentStep(3);
    else if (formData.name && formData.email && formData.phone) setCurrentStep(2);
    else setCurrentStep(1);
  }, [formData.name, formData.email, formData.phone,
      formData.department, formData.date, formData.time]);

  // ── Initial Load ──
  useEffect(() => {
    setIsMounted(true);
    const fetchDepartments = async () => {
      try {
        const res = await fetch('/api/departments');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDepartmentList(data);
          } else {
            setDepartmentList([
              { _id: '1', name: 'Pulmonology' },
              { _id: '2', name: 'Orthopedics' },
              { _id: '3', name: 'Gynaecology' },
              { _id: '4', name: 'ENT' },
              { _id: '5', name: 'General Medicine' },
              { _id: '6', name: 'General Surgery' },
            ]);
          }
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  // ── Fetch Slots ──
  const fetchSlotsFromAdmin = useCallback(async (dateStr, dept) => {
    if (!dept) { setAvailableSlots([]); return; }
    setIsLoadingSlots(true);
    setAvailableSlots([]);
    setIsHoliday(false);
    try {
      const res = await fetch(
        `/api/slots?date=${dateStr}&department=${encodeURIComponent(dept)}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.isHoliday) {
        setIsHoliday(true);
        toast.error('🚫 Clinic is closed on this date');
      } else if (data.slots && Array.isArray(data.slots)) {
        setAvailableSlots(data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch {
      toast.error('Could not load time slots');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  // ── Date change effect ──
  useEffect(() => {
    const dateStr = getFormattedDate(selectedDate);
    setFormData((prev) => ({ ...prev, date: dateStr, time: '' }));
    if (formData.department) fetchSlotsFromAdmin(dateStr, formData.department);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // ── Auto-refresh for today ──
  useEffect(() => {
    const isToday = getFormattedDate(selectedDate) === getFormattedDate(new Date());
    if (!isToday || !formData.department) return;
    const interval = setInterval(() => {
      fetchSlotsFromAdmin(formData.date, formData.department);
    }, 60000);
    return () => clearInterval(interval);
  }, [formData.date, formData.department, selectedDate, fetchSlotsFromAdmin]);

  // ── Handlers ──
  const handleDepartmentChange = (dept) => {
    setFormData((prev) => ({ ...prev, department: dept, time: '' }));
    fetchSlotsFromAdmin(getFormattedDate(selectedDate), dept);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'department') { handleDepartmentChange(value); return; }
    if (name === 'file') {
      const file = files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error('❌ File size must be less than 5MB');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            file,
            fileBase64: reader.result,
            fileName: file.name,
            fileType: file.type,
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'booked') { toast.error('⏰ This slot is already booked'); return; }
    if (slot.status === 'closed') { toast.error('🚫 This slot is closed'); return; }
    if (isSlotInPast(slot.time, formData.date)) {
      toast.error('⏰ This time has already passed');
      return;
    }
    setFormData((prev) => ({ ...prev, time: slot.time }));
    toast.success(`✅ Slot ${slot.time} selected!`, { duration: 2000 });
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null, fileBase64: '', fileName: '', fileType: '',
    }));
  };

  // ── Razorpay ──
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpayPayment = async () => {
    setPaymentLoading(true);
    const loadingToast = toast.loading('Initializing payment...');
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.dismiss(loadingToast);
        toast.error('Failed to load payment gateway');
        setPaymentLoading(false);
        return;
      }

      const fee = CONSULTATION_FEES[formData.appointmentType];
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: fee,
          service: `${formData.department} - ${formData.appointmentType} Consultation`,
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone,
        }),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);
      if (!data.success) {
        toast.error(data.error || 'Failed to create payment order');
        setPaymentLoading(false);
        return;
      }

      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const options = {
        key: razorpayKeyId,
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: 'Aadhunika Hospital 🏥',
        description: `${formData.department} - Online Consultation`,
        image: '/Aadhunika.png',
        order_id: data.order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone.startsWith('+91')
            ? formData.phone
            : `+91${formData.phone}`,
        },
        theme: { color: '#059669', backdrop_color: 'rgba(0,0,0,0.6)' },
        notes: {
          patient_name: formData.name,
          department: formData.department,
          appointment_date: formData.date,
          appointment_time: formData.time,
        },
        handler: async (response) => {
          const verifyToast = toast.loading('Verifying payment...');
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            toast.dismiss(verifyToast);
            if (verifyData.success) {
              toast.success('💳 Payment verified!');
              await submitBooking(
                response.razorpay_payment_id,
                response.razorpay_order_id
              );
            } else {
              toast.error('⚠️ Payment verification failed. Contact support.');
            }
          } catch {
            toast.dismiss(verifyToast);
            await submitBooking(
              response.razorpay_payment_id,
              response.razorpay_order_id
            );
          }
          setPaymentLoading(false);
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setPaymentLoading(false);
          },
          escape: true,
          backdropclose: false,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(
          `Payment Failed: ${response.error?.description || 'Unknown error'}`
        );
        setPaymentLoading(false);
      });
      rzp.open();
    } catch {
      toast.dismiss(loadingToast);
      toast.error('Something went wrong. Please try again.');
      setPaymentLoading(false);
    }
  };

  // ── Submit Booking ──
  const submitBooking = async (paymentId = null, orderId = null) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      paymentId
        ? 'Confirming appointment & generating Zoom link...'
        : 'Confirming appointment...'
    );
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          appointmentType: formData.appointmentType,
          department: formData.department,
          date: formData.date,
          time: formData.time,
          message: formData.message,
          fileBase64: formData.appointmentType === 'Online' ? formData.fileBase64 : '',
          fileName: formData.appointmentType === 'Online' ? formData.fileName : '',
          fileType: formData.appointmentType === 'Online' ? formData.fileType : '',
          paymentId: paymentId || null,
          orderId: orderId || null,
          paymentStatus: paymentId ? 'PAID' : 'UNPAID',
          amountPaid: paymentId ? CONSULTATION_FEES[formData.appointmentType] : 0,
        }),
      });
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success('✅ Appointment Booked Successfully!', { duration: 4000 });
        if (formData.appointmentType === 'Online') {
          toast(
            data.meetingLink
              ? '📹 Zoom meeting created! Link emailed.'
              : '📹 Zoom link will be sent after admin confirms.',
            { icon: '📧', duration: 6000 }
          );
        }
        await fetchSlotsFromAdmin(formData.date, formData.department);
        setFormData((prev) => ({
          ...prev,
          name: '', email: '', phone: '', message: '', time: '',
          appointmentType: 'Offline',
          file: null, fileBase64: '', fileName: '', fileType: '',
        }));
        if (paymentId) {
          router.push(
            `/payment-success?paymentId=${paymentId}&orderId=${orderId}&bookingId=${data.bookingId || ''}`
          );
        }
      } else {
        toast.error('❌ ' + (data.message || 'Failed to book'));
        if (res.status === 409) {
          await fetchSlotsFromAdmin(formData.date, formData.department);
        }
      }
    } catch {
      toast.dismiss(loadingToast);
      toast.error('❌ Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
      setPaymentLoading(false);
    }
  };

  // ── Form Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('📝 Enter patient name');
    if (!formData.email.trim()) return toast.error('📧 Enter email address');
    if (!formData.phone.trim() || formData.phone.length < 10)
      return toast.error('📱 Enter valid 10-digit phone number');
    if (!formData.department) return toast.error('🏥 Select a department');
    if (!formData.time) return toast.error('⏰ Select a time slot');
    if (formData.appointmentType === 'Online' && !formData.fileBase64)
      return toast.error('📎 Upload medical reports for online consultation');
    if (isSubmitting || paymentLoading) return;
    if (formData.appointmentType === 'Online') await handleRazorpayPayment();
    else await submitBooking();
  };

  // ── Derived State ──
  const safeSlots = Array.isArray(availableSlots) ? availableSlots : [];
  const filteredSlots = filterAvailableSlots(safeSlots, formData.date);
  const slotStats = {
    available: filteredSlots.filter((s) => s.status === 'available').length,
    booked: filteredSlots.filter((s) => s.status === 'booked').length,
    hidden: safeSlots.length - filteredSlots.length,
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '13px 16px',
    borderRadius: 12, fontFamily: 'inherit', fontSize: 15,
    background: 'transparent', outline: 'none',
    borderWidth: 2, borderStyle: 'solid',
    borderColor: focusedField === field ? '#0F766E' : '#E5E7EB',
    boxShadow: focusedField === field
      ? '0 0 0 4px rgba(15,118,110,0.1)'
      : 'none',
    transform: focusedField === field ? 'translateY(-1px)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
  });

  if (!isMounted) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFF0 40%, #F0F9FF 100%)',
      paddingTop: 'clamp(80px,10vw,120px)',
      paddingBottom: 60,
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* ── Hero Header ── */}
      <div style={{
        textAlign: 'center', padding: '0 20px 40px',
        animation: 'fadeInDown 0.8s ease both',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(15,118,110,0.1)',
          borderWidth: 1, borderStyle: 'solid',
          borderColor: 'rgba(15,118,110,0.2)', color: '#0F766E',
          padding: '6px 18px', borderRadius: 50, fontSize: 12,
          fontWeight: 700, letterSpacing: '1.5px',
          textTransform: 'uppercase', marginBottom: 16,
        }}>
          <span style={{
            width: 8, height: 8, background: '#059669',
            borderRadius: '50%', animation: 'pulse 2s infinite',
          }} />
          Online & Offline Appointments
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800,
          color: '#0F766E', margin: '0 0 12px', lineHeight: 1.2,
        }}>
          Book Your Appointment
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 17px)',
          color: '#374151', maxWidth: 520, margin: '0 auto',
        }}>
          Consult our specialists in-person or via video call. Fast, easy, and convenient.
        </p>
      </div>

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 clamp(12px, 3vw, 40px)',
      }}>
        <StepIndicator currentStep={currentStep} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(20px, 3vw, 40px)',
          alignItems: 'flex-start',
        }}>
          {/* ── LEFT: FORM ── */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#fff', borderRadius: 24,
              boxShadow: '0 8px 40px rgba(0,0,0,0.09)',
              borderWidth: 1, borderStyle: 'solid',
              borderColor: 'rgba(0,0,0,0.07)',
              overflow: 'hidden',
              animation: 'fadeInUp 0.8s ease both',
            }}
          >
            {/* Form Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0F766E, #059669)',
              padding: '24px 28px',
            }}>
              <h2 style={{
                fontSize: 20, fontWeight: 800, color: '#fff',
                margin: 0, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                📋 Patient Details
              </h2>
              <p style={{
                fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '6px 0 0',
              }}>
                Fill in your details below to book your appointment
              </p>
            </div>

            <div style={{ padding: 'clamp(20px, 3vw, 32px)' }}>

              {/* ── Consultation Type ── */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  fontSize: 13, fontWeight: 700, color: '#374151',
                  display: 'block', marginBottom: 10,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  📋 Consultation Type *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { value: 'Offline', label: 'Hospital Visit', sub: 'Free', icon: '🏥' },
                    { value: 'Online', label: 'Online Consultation', sub: `₹${CONSULTATION_FEES.Online}`, icon: '👨‍⚕️💻' },
                  ].map((type) => {
                    const active = formData.appointmentType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          appointmentType: type.value,
                          file: null, fileBase64: '', fileName: '', fileType: '',
                        }))}
                        style={{
                          padding: '14px 12px', borderRadius: 14,
                          textAlign: 'center', cursor: 'pointer',
                          fontFamily: 'inherit',
                          borderWidth: 2, borderStyle: 'solid',
                          borderColor: active ? '#0F766E' : '#E5E7EB',
                          background: active
                            ? 'linear-gradient(135deg, rgba(15,118,110,0.08), rgba(5,150,105,0.05))'
                            : '#fff',
                          boxShadow: active
                            ? '0 4px 16px rgba(15,118,110,0.2)'
                            : '0 2px 6px rgba(0,0,0,0.04)',
                          transform: active ? 'translateY(-2px)' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{type.icon}</div>
                        <div style={{
                          fontSize: 13, fontWeight: 700,
                          color: active ? '#0F766E' : '#374151',
                        }}>
                          {type.label}
                        </div>
                        <div style={{
                          fontSize: 12, fontWeight: 800,
                          color: active ? '#059669' : '#94A3B8', marginTop: 2,
                        }}>
                          {type.sub}
                        </div>
                        {active && (
                          <div style={{
                            marginTop: 6, fontSize: 10,
                            color: '#0F766E', fontWeight: 700,
                          }}>
                            ✓ Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Personal Info Section ── */}
              <div style={{
                background: '#F8FAFC', borderRadius: 14, padding: '20px',
                marginBottom: 20, borderWidth: 1, borderStyle: 'solid',
                borderColor: '#E2E8F0',
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 800, color: '#64748B',
                  textTransform: 'uppercase', letterSpacing: '1px',
                  margin: '0 0 14px',
                }}>
                  👤 Personal Information
                </p>

                <FormInput label="Full Name" required icon="👤">
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter patient full name"
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required style={inputStyle('name')}
                  />
                </FormInput>

                <FormInput label="Email Address" required icon="📧">
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="patient@email.com"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required style={inputStyle('email')}
                  />
                </FormInput>

                <FormInput label="Mobile Number" required icon="📱">
                  <input
                    type="tel" name="phone" value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{ ...inputStyle('phone'), marginBottom: 0 }}
                  />
                </FormInput>
              </div>

              {/* ── Department ── */}
              <FormInput label="Department" required icon="🏥">
                <select
                  name="department" value={formData.department}
                  onChange={handleChange} required
                  onFocus={() => setFocusedField('department')}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle('department')}
                >
                  <option value="">— Select Department —</option>
                  {departmentList.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </FormInput>

              {/* ── Calendar ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  fontSize: 13, fontWeight: 700, color: '#374151',
                  display: 'block', marginBottom: 10,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  📅 Select Date *
                </label>
                <div style={{
                  background: '#F8FAFC', borderRadius: 14, padding: 16,
                  borderWidth: 1, borderStyle: 'solid', borderColor: '#E2E8F0',
                }}>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    minDate={new Date()}
                    className="custom-calendar"
                    locale="en-US"
                  />
                  {formData.date && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', background: '#fff',
                      borderRadius: 10, borderWidth: 1, borderStyle: 'solid',
                      borderColor: '#E2E8F0',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ fontSize: 18 }}>📅</span>
                      <div>
                        <p style={{
                          fontSize: 11, color: '#64748B', margin: 0,
                          fontWeight: 600, textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>Selected Date</p>
                        <p style={{
                          fontSize: 15, fontWeight: 700,
                          color: '#0F766E', margin: '2px 0 0',
                        }}>
                          {formData.date}
                        </p>
                      </div>
                      {formData.department && (
                        <>
                          <div style={{
                            width: 1, height: 36,
                            background: '#E2E8F0', margin: '0 4px',
                          }} />
                          <div>
                            <p style={{
                              fontSize: 11, color: '#64748B', margin: 0,
                              fontWeight: 600, textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}>Department</p>
                            <p style={{
                              fontSize: 15, fontWeight: 700,
                              color: '#7c3aed', margin: '2px 0 0',
                            }}>
                              {formData.department}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Time Slots ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  fontSize: 13, fontWeight: 700, color: '#374151',
                  display: 'block', marginBottom: 10,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  ⏰ Select Time Slot *
                </label>

                {!formData.department ? (
                  <div style={{
                    textAlign: 'center', padding: '28px 20px',
                    background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                    borderRadius: 14, borderWidth: 2, borderStyle: 'dashed',
                    borderColor: '#FCD34D',
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🏥</div>
                    <p style={{
                      fontWeight: 700, color: '#92400E',
                      fontSize: 15, margin: '0 0 4px',
                    }}>
                      Select a Department First
                    </p>
                    <p style={{ fontSize: 13, color: '#B45309', margin: 0 }}>
                      Time slots will appear after department selection
                    </p>
                  </div>
                ) : isHoliday && !isLoadingSlots ? (
                  <div style={{
                    textAlign: 'center', padding: '28px 20px',
                    background: '#FFF1F2', borderRadius: 14,
                    borderWidth: 1, borderStyle: 'solid', borderColor: '#FECDD3',
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🚫</div>
                    <p style={{
                      fontWeight: 700, color: '#BE123C',
                      fontSize: 15, margin: '0 0 4px',
                    }}>Clinic Closed</p>
                    <p style={{ fontSize: 13, color: '#E11D48', margin: 0 }}>
                      No appointments available on this date
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background: '#F8FAFC', borderRadius: 14, padding: 16,
                    borderWidth: 1, borderStyle: 'solid', borderColor: '#E2E8F0',
                  }}>
                    {/* Slot Stats */}
                    {!isLoadingSlots && filteredSlots.length > 0 && (
                      <div style={{
                        display: 'flex', gap: 8,
                        marginBottom: 14, flexWrap: 'wrap',
                      }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: '#065F46',
                          background: '#D1FAE5', padding: '4px 10px',
                          borderRadius: 20, display: 'flex',
                          alignItems: 'center', gap: 4,
                        }}>
                          ✅ Available: {slotStats.available}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: '#991B1B',
                          background: '#FEE2E2', padding: '4px 10px',
                          borderRadius: 20, display: 'flex',
                          alignItems: 'center', gap: 4,
                        }}>
                          🔴 Booked: {slotStats.booked}
                        </span>
                        {slotStats.hidden > 0 && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#92400E',
                            background: '#FEF3C7', padding: '4px 10px',
                            borderRadius: 20, display: 'flex',
                            alignItems: 'center', gap: 4,
                          }}>
                            ⏰ Past: {slotStats.hidden}
                          </span>
                        )}
                        {formData.time && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: '#065F46',
                            background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                            padding: '4px 10px', borderRadius: 20,
                            display: 'flex', alignItems: 'center',
                            gap: 4, marginLeft: 'auto',
                          }}>
                            🕐 Selected: {formData.time}
                          </span>
                        )}
                      </div>
                    )}

                    {isLoadingSlots ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                        <div style={{
                          width: 36, height: 36, margin: '0 auto 14px',
                          borderWidth: 3, borderStyle: 'solid',
                          borderColor: '#CCFBF1', borderTopColor: '#0F766E',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                        <p style={{
                          color: '#64748B', fontSize: 14, fontWeight: 500,
                        }}>
                          Loading available slots...
                        </p>
                      </div>
                    ) : filteredSlots.length === 0 ? (
                      <div style={{
                        textAlign: 'center', padding: '24px 20px',
                        background: '#FFF1F2', borderRadius: 10,
                        borderWidth: 1, borderStyle: 'solid',
                        borderColor: '#FECDD3',
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>😔</div>
                        <p style={{
                          fontWeight: 700, color: '#BE123C',
                          margin: '0 0 4px',
                        }}>
                          No Slots Available
                        </p>
                        <p style={{ fontSize: 12, color: '#E11D48', margin: 0 }}>
                          {safeSlots.length > 0
                            ? 'All slots for today have passed. Please choose another date.'
                            : 'Please select another date.'}
                        </p>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex', flexDirection: 'column', gap: 8,
                      }}>
                        {filteredSlots.map((slot, index) => {
                          const isBooked = slot.status === 'booked';
                          const isClosed = slot.status === 'closed';
                          const isPast = isSlotInPast(slot.time, formData.date);
                          const isUnavailable = isBooked || isClosed || isPast;
                          const isSelected = formData.time === slot.time;
                          return (
                            <SlotButton
                              key={index}
                              slot={slot}
                              isSelected={isSelected}
                              isUnavailable={isUnavailable}
                              isPast={isPast}
                              isBooked={isBooked}
                              isClosed={isClosed}
                              onClick={() => handleSlotClick(slot)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── File Upload (Online Only) ── */}
              {formData.appointmentType === 'Online' && (
                <div style={{
                  marginBottom: 20,
                  animation: 'fadeInUp 0.4s ease both',
                }}>
                  <label style={{
                    fontSize: 13, fontWeight: 700, color: '#374151',
                    display: 'block', marginBottom: 10,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    📎 Medical Reports *
                  </label>
                  {!formData.file ? (
                    <label
                      style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 8, padding: '28px 20px', cursor: 'pointer',
                        borderRadius: 14, borderWidth: 2,
                        borderStyle: 'dashed', borderColor: '#93C5FD',
                        background: 'linear-gradient(135deg, #EFF6FF, #EEF2FF)',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#3B82F6';
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #DBEAFE, #E0E7FF)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#93C5FD';
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #EFF6FF, #EEF2FF)';
                      }}
                    >
                      <div style={{ fontSize: 36 }}>📎</div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{
                          fontWeight: 700, color: '#1E40AF',
                          margin: '0 0 4px', fontSize: 15,
                        }}>
                          Upload Medical Reports
                        </p>
                        <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                          PDF, JPG, PNG — Max 5MB
                        </p>
                      </div>
                      <input
                        type="file" name="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleChange}
                        style={{ display: 'none' }} required
                      />
                    </label>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px', gap: 12, flexWrap: 'wrap',
                      background: 'linear-gradient(135deg, #F0FDFA, #ECFDF5)',
                      borderRadius: 12, borderWidth: 1, borderStyle: 'solid',
                      borderColor: '#CCFBF1',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <span style={{ fontSize: 28 }}>
                          {formData.fileType.includes('pdf') ? '📄' : '🖼️'}
                        </span>
                        <div>
                          <p style={{
                            fontWeight: 700, fontSize: 14,
                            margin: '0 0 2px', color: '#065F46',
                          }}>
                            {formData.fileName}
                          </p>
                          <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                            {(formData.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button" onClick={removeFile}
                        style={{
                          background: 'linear-gradient(135deg, #6B0000, #9b0000)',
                          color: '#fff', borderWidth: 0, borderStyle: 'none',
                          padding: '7px 14px', borderRadius: 8,
                          cursor: 'pointer', fontWeight: 700, fontSize: 12,
                          fontFamily: 'inherit', transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e =>
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }
                        onMouseLeave={e =>
                          e.currentTarget.style.transform = 'none'
                        }
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Message ── */}
              <FormInput label="Health Concern" icon="💬">
                <textarea
                  rows={3} name="message" value={formData.message}
                  onChange={handleChange}
                  placeholder="Briefly describe your health concern (optional)..."
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle('message'),
                    resize: 'vertical', minHeight: 90,
                  }}
                />
              </FormInput>

              {/* ── Payment Summary (Online) ── */}
              {formData.appointmentType === 'Online' && (
                <div style={{
                  background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
                  borderRadius: 16, padding: '20px 22px', marginBottom: 20,
                  borderWidth: 2, borderStyle: 'solid', borderColor: '#86EFAC',
                  animation: 'fadeInUp 0.4s ease both',
                }}>
                  <h3 style={{
                    fontSize: 16, fontWeight: 800, color: '#166534',
                    margin: '0 0 14px',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    🧾 Payment Summary
                  </h3>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 8, fontSize: 14, color: '#374151',
                  }}>
                    <span>
                      {formData.department || 'Department'} — Online Consultation
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      ₹{CONSULTATION_FEES.Online}
                    </span>
                  </div>
                  <div style={{
                    borderWidth: 0, borderTopWidth: 2,
                    borderStyle: 'dashed', borderColor: '#86EFAC',
                    margin: '12px 0',
                  }} />
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 20, fontWeight: 800, color: '#065F46',
                  }}>
                    <span>Total Payable</span>
                    <span style={{ color: '#059669' }}>
                      ₹{CONSULTATION_FEES.Online}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Submit Button ── */}
              <button
                type="submit"
                disabled={isSubmitting || paymentLoading}
                style={{
                  width: '100%', padding: '17px 24px',
                  background: isSubmitting || paymentLoading
                    ? '#9CA3AF'
                    : formData.appointmentType === 'Online'
                      ? 'linear-gradient(135deg, #6B0000, #9b0000)'
                      : 'linear-gradient(135deg, #059669, #0F766E)',
                  color: '#fff', borderWidth: 0, borderStyle: 'none',
                  borderRadius: 14, fontSize: 17, fontWeight: 800,
                  cursor: isSubmitting || paymentLoading
                    ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.3px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 10,
                  boxShadow: isSubmitting || paymentLoading
                    ? 'none'
                    : formData.appointmentType === 'Online'
                      ? '0 8px 25px rgba(107,0,0,0.35)'
                      : '0 8px 25px rgba(5,150,105,0.35)',
                  transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
                }}
                onMouseEnter={e => {
                  if (!isSubmitting && !paymentLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      formData.appointmentType === 'Online'
                        ? '0 14px 35px rgba(107,0,0,0.45)'
                        : '0 14px 35px rgba(5,150,105,0.45)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow =
                    formData.appointmentType === 'Online'
                      ? '0 8px 25px rgba(107,0,0,0.35)'
                      : '0 8px 25px rgba(5,150,105,0.35)';
                }}
              >
                {isSubmitting || paymentLoading ? (
                  <>
                    <div style={{
                      width: 20, height: 20,
                      borderWidth: 2, borderStyle: 'solid',
                      borderColor: 'rgba(255,255,255,0.4)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Processing...
                  </>
                ) : formData.appointmentType === 'Online' ? (
                  `💳 Pay ₹${CONSULTATION_FEES.Online} & Book Appointment`
                ) : (
                  '📅 Request Appointment'
                )}
              </button>

              {formData.appointmentType === 'Online' && (
                <p style={{
                  textAlign: 'center', fontSize: 11, color: '#9CA3AF',
                  marginTop: 12, lineHeight: 1.6,
                }}>
                  🔒 Secured by Razorpay | 256-bit SSL Encryption<br />
                  UPI (GPay, PhonePe, Paytm) + QR Code + Card + NetBanking
                </p>
              )}
            </div>
          </form>

          {/* ── RIGHT: INFO PANEL ── */}
          <InfoPanel
            appointmentType={formData.appointmentType}
            formData={formData}
          />
        </div>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.3); opacity: 0.7; }
        }
        .custom-calendar {
          width: 100% !important;
          border: none !important;
          font-family: inherit;
          background: transparent !important;
        }
        .react-calendar__tile {
          padding: 10px 4px !important;
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
        }
        .react-calendar__tile--active {
          background: linear-gradient(135deg, #0F766E, #059669) !important;
          color: #fff !important;
          box-shadow: 0 4px 12px rgba(15,118,110,0.35) !important;
        }
        .react-calendar__tile--now {
          background: #FEF3C7 !important;
          color: #D97706 !important;
        }
        .react-calendar__tile:hover:not(.react-calendar__tile--active):not(:disabled) {
          background: rgba(15,118,110,0.1) !important;
          color: #0F766E !important;
        }
        .react-calendar__tile:disabled {
          color: #CBD5E1 !important;
          background: transparent !important;
          cursor: not-allowed !important;
        }
        .react-calendar__navigation button:hover {
          background: rgba(15,118,110,0.1) !important;
          border-radius: 8px !important;
        }
        @media (max-width: 640px) {
          .react-calendar__tile {
            padding: 8px 2px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}