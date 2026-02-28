// src/app/booking/page.jsx
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter } from 'next/navigation';

// =============================================
// TIME UTILITY FUNCTIONS (Robust Version)
// =============================================

/**
 * Robustly parses time strings to minutes from midnight.
 * Handles: "9am", "9:30am", "09:00 AM", "12pm", "9am-10am"
 */
const timeToMinutes = (timeStr) => {
  try {
    if (!timeStr) return -1;

    // 1. Get the start time part (before the hyphen)
    // Example: "9am-10am" -> "9am"
    const startPart = timeStr.split(/-|–/)[0].trim().toLowerCase();

    // 2. Regex to find hours, minutes (optional), and am/pm
    // Matches: "9am", "9:30am", "9 am", "12pm"
    const match = startPart.match(/(\d+)(?::(\d+))?\s*(am|pm)/);

    if (!match) {
      console.warn("Could not parse time:", timeStr);
      return -1; // Keep slot if we can't parse it
    }

    let [_, hoursStr, minutesStr, period] = match;
    let hours = parseInt(hoursStr, 10);
    let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

    // 3. Convert to 24-hour format (Minutes from midnight)
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return (hours * 60) + minutes;
  } catch (e) {
    console.error('Time parsing error:', timeStr, e);
    return -1;
  }
};

/**
 * Check if a time slot is in the past relative to current time
 */
const isSlotInPast = (slotTime, selectedDateString) => {
  const now = new Date();
  
  if (!selectedDateString) return false;

  // Create a Date object for the selected date (set to midnight local time)
  // selectedDateString is expected to be "YYYY-MM-DD"
  const [year, month, day] = selectedDateString.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date

  // 1. Check if selected date is in the future (Tomorrow onwards)
  const isFutureDate = 
    selectedDate.getFullYear() > now.getFullYear() ||
    (selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() > now.getMonth()) ||
    (selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth() && selectedDate.getDate() > now.getDate());

  if (isFutureDate) {
    return false; // Future dates always show all slots
  }

  // 2. Check if selected date is in the past (Yesterday backwards)
  const isPastDate = 
    selectedDate.getFullYear() < now.getFullYear() ||
    (selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() < now.getMonth()) ||
    (selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth() && selectedDate.getDate() < now.getDate());

  if (isPastDate) {
    return true; // Past dates should hide/disable slots
  }

  // 3. --- IT IS TODAY ---
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();
  const slotStartMinutes = timeToMinutes(slotTime);

  // If parsing failed (-1), show the slot to be safe
  if (slotStartMinutes === -1) return false;

  // Compare: If slot start time is less than current time, it's in the past
  // Buffer: Add 0 minutes for strict comparison
  const BUFFER_MINUTES = 0; 
  
  return slotStartMinutes < (currentMinutes + BUFFER_MINUTES);
};

/**
 * Filter slots to remove past times for today
 */
const filterAvailableSlots = (slots, selectedDateString) => {
  if (!Array.isArray(slots)) return [];
  
  return slots.filter(slot => {
    // Always show booked/closed slots (so user knows they exist but are taken)
    if (slot.status === 'booked' || slot.status === 'closed') {
      return true;
    }
    
    // Filter out available slots that have passed
    return !isSlotInPast(slot.time, selectedDateString);
  });
};

// =============================================
// MAIN COMPONENT
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    appointmentType: 'Offline',
    department: '',
    date: '',
    time: '',
    message: '',
    file: null,
    fileBase64: '',
    fileName: '',
    fileType: '',
  });

  // =============================================
  // CONSULTATION FEE
  // =============================================
  const CONSULTATION_FEES = {
    Online: 5, // ₹5 for testing, change to real amount
    Offline: 0,
  };

  // =============================================
  // 1. INITIAL LOAD
  // =============================================
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
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const getFormattedDate = (dateObj) => dateObj.toLocaleDateString('en-CA');

  // =============================================
  // 2. FETCH SLOTS
  // =============================================
  const fetchSlotsFromAdmin = async (dateStr, dept) => {
    if (!dept) {
      setAvailableSlots([]);
      return;
    }

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
        setAvailableSlots([]);
        toast.error('🚫 Clinic is closed on this date');
      } else if (data.slots && Array.isArray(data.slots)) {
        setAvailableSlots(data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Slots Fetch Error:', error);
      toast.error('Could not load time slots');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // =============================================
  // 3. EVENT HANDLERS
  // =============================================
  useEffect(() => {
    const dateStr = getFormattedDate(selectedDate);
    setFormData((prev) => ({ ...prev, date: dateStr, time: '' }));
    if (formData.department) {
      fetchSlotsFromAdmin(dateStr, formData.department);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // =============================================
  // 🔥 AUTO-REFRESH SLOTS FOR TODAY (OPTIONAL)
  // =============================================
  useEffect(() => {
    // Only auto-refresh if viewing today's date
    const isToday = getFormattedDate(selectedDate) === getFormattedDate(new Date());
    
    if (!isToday || !formData.department) return;
    
    // Refresh slots every 60 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing slots...');
      fetchSlotsFromAdmin(formData.date, formData.department);
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [formData.date, formData.department, selectedDate]);

  const handleDepartmentChange = (dept) => {
    setFormData((prev) => ({ ...prev, department: dept, time: '' }));
    const dateStr = getFormattedDate(selectedDate);
    fetchSlotsFromAdmin(dateStr, dept);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'department') {
      handleDepartmentChange(value);
      return;
    }

    if (name === 'file') {
      const file = files ? files[0] : null;
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
    if (slot.status === 'booked') {
      toast.error('⏰ This slot is already booked');
      return;
    }
    if (slot.status === 'closed') {
      toast.error('🚫 This slot is closed');
      return;
    }
    
    // 🔥 NEW: Prevent selecting past slots
    if (isSlotInPast(slot.time, formData.date)) {
      toast.error('⏰ This time has already passed. Please select a future slot.');
      return;
    }
    
    setFormData((prev) => ({ ...prev, time: slot.time }));
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
      fileBase64: '',
      fileName: '',
      fileType: '',
    }));
  };

  // =============================================
  // 4. 🔥 RAZORPAY WITH FULL UPI SUPPORT
  // =============================================
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
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
  };

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
      const isTestMode = razorpayKeyId?.startsWith('rzp_test_');

      const options = {
        key: razorpayKeyId,
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: 'Aadhunika Hospital 🏥',
        description: `${formData.department} - Online Consultation`,
        image: '/logo.png',
        order_id: data.order.id,

        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone.startsWith('+91')
            ? formData.phone
            : `+91${formData.phone}`,
        },

        theme: {
          color: '#059669',
          backdrop_color: 'rgba(0,0,0,0.6)',
        },

        notes: {
          patient_name: formData.name,
          department: formData.department,
          appointment_date: formData.date,
          appointment_time: formData.time,
          appointment_type: formData.appointmentType,
        },

        handler: async function (response) {
          console.log('✅ Payment Success:', response);
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
          } catch (verifyError) {
            toast.dismiss(verifyToast);
            toast('⚠️ Verification check failed, booking anyway...', {
              icon: '⚠️',
            });
            await submitBooking(
              response.razorpay_payment_id,
              response.razorpay_order_id
            );
          }
          setPaymentLoading(false);
        },

        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled by user');
            setPaymentLoading(false);
          },
          escape: true,
          backdropclose: false,
          confirm_close: true,
        },
      };

      if (!isTestMode) {
        options.config = {
          display: {
            blocks: {
              upi: {
                name: '📱 Pay via UPI',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['qr', 'collect', 'intent'],
                    apps: ['google_pay', 'phonepe', 'paytm'],
                  },
                ],
              },
              other: {
                name: '💳 Other Payment Methods',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: false,
            },
          },
        };
      }

      console.log(
        isTestMode
          ? '⚠️ TEST MODE: UPI disabled by Razorpay. Use Card/NetBanking to test.'
          : '✅ LIVE MODE: UPI + QR + GPay/PhonePe/Paytm enabled'
      );

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response.error);
        const errorDesc = response.error?.description || 'Payment failed';
        toast.error(`Payment Failed: ${errorDesc}`, { duration: 6000 });
        setPaymentLoading(false);
      });

      razorpayInstance.open();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Something went wrong. Please try again.');
      console.error('Payment init error:', error);
      setPaymentLoading(false);
    }
  };

  // =============================================
  // 5. SUBMIT BOOKING
  // =============================================
  const submitBooking = async (paymentId = null, orderId = null) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      paymentId ? 'Confirming appointment & generating Zoom link...' : 'Confirming appointment...'
    );

    try {
      const bookingData = {
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
      };

      console.log('📤 Sending booking:', {
        ...bookingData,
        fileBase64: bookingData.fileBase64 ? '[FILE]' : '[NO FILE]',
      });

      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success('✅ Appointment Booked Successfully!', { duration: 4000 });

        if (formData.appointmentType === 'Online') {
          if (data.meetingLink) {
            toast.success('📹 Zoom meeting created! Link will be emailed on confirmation.', {
              duration: 6000,
              style: {
                background: '#EFF6FF',
                color: '#1E40AF',
                border: '1px solid #93C5FD',
              },
            });
          } else {
            toast('📹 Zoom link will be sent once admin confirms.', {
              icon: '📧',
              duration: 6000,
              style: {
                background: '#EFF6FF',
                color: '#1E40AF',
                border: '1px solid #93C5FD',
                fontWeight: '600',
              },
            });
          }
        }

        await fetchSlotsFromAdmin(formData.date, formData.department);

        setFormData((prev) => ({
          ...prev,
          name: '',
          email: '',
          phone: '',
          message: '',
          time: '',
          appointmentType: 'Offline',
          file: null,
          fileBase64: '',
          fileName: '',
          fileType: '',
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
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('❌ Booking error:', error);
      toast.error('❌ Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
      setPaymentLoading(false);
    }
  };

  // =============================================
  // 6. MAIN FORM SUBMIT
  // =============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error('📝 Enter patient name');
    if (!formData.email.trim()) return toast.error('📧 Enter email address');
    if (!formData.phone.trim() || formData.phone.length < 10)
      return toast.error('📱 Enter valid phone number');
    if (!formData.department) return toast.error('🏥 Select a department');
    if (!formData.time) return toast.error('⏰ Select a time slot');
    if (formData.appointmentType === 'Online' && !formData.fileBase64)
      return toast.error('📎 Upload medical reports for online consultation');
    if (isSubmitting || paymentLoading) return;

    if (formData.appointmentType === 'Online') {
      await handleRazorpayPayment();
    } else {
      await submitBooking();
    }
  };

  // =============================================
  // HELPERS
  // =============================================
  const safeSlots = Array.isArray(availableSlots) ? availableSlots : [];
  
  // 🔥 Filter slots in real-time using formData.date (YYYY-MM-DD string)
  const filteredSlots = filterAvailableSlots(safeSlots, formData.date);
  
  const slotStats = {
    total: filteredSlots.length,
    available: filteredSlots.filter((s) => s.status === 'available').length,
    booked: filteredSlots.filter((s) => s.status === 'booked').length,
    closed: filteredSlots.filter((s) => s.status === 'closed').length,
    hidden: safeSlots.length - filteredSlots.length, // Past slots hidden
  };

  if (!isMounted) return null;

  // =============================================
  // RENDER
  // =============================================
  return (
    <section className="booking-page min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <h1 style={{ textAlign: 'center', color: 'darkgreen', margin: '25px' }}>
          🩺 Book Appointment
        </h1>

        <div className="booking-layout">
          {/* ===== LEFT: BOOKING FORM ===== */}
          <form
            className="booking-form bg-transparent p-8 rounded-2xl shadow-xl"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-bold mb-8 text-green-600">
              🩺 Book Appointment
            </h2>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl outline-none"
                  placeholder="Enter patient full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl outline-none"
                  placeholder="patient@email.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl outline-none"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>

              {/* Consultation Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Consultation Type *
                </label>
                <select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl font-medium text-indigo-900 outline-none"
                  required
                >
                  <option value="Offline">🏥 Hospital Visit (Offline) — Free</option>
                  <option value="Online">
                    📹 Video Consultation (Online) — ₹{CONSULTATION_FEES.Online}
                  </option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-teal-300 rounded-xl font-semibold text-teal-900 outline-none"
                  required
                >
                  <option value="">🏥 Select Department</option>
                  {departmentList.length > 0 ? (
                    departmentList.map((dept) => (
                      <option key={dept._id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading departments...</option>
                  )}
                </select>
              </div>

              {/* Calendar & Slots */}
              <div className="calendar-slot-section">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Date & Time Slot *
                </label>

                <div className="calendar-wrapper mb-6">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    minDate={new Date()}
                    className="custom-calendar"
                    locale="en-US"
                  />
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-500">
                      📅 Date:{' '}
                      <span className="font-bold text-indigo-600">{formData.date}</span>
                    </p>
                    {formData.department && (
                      <p className="text-sm text-gray-500 mt-1">
                        🏥 Department:{' '}
                        <span className="font-bold text-teal-600">{formData.department}</span>
                      </p>
                    )}
                  </div>
                </div>

                {!formData.department && (
                  <div className="text-center py-6 bg-amber-50 rounded-xl border-2 border-amber-200 mb-4">
                    <p className="text-2xl mb-2">🏥</p>
                    <p className="font-semibold text-amber-700">
                      Please select a Department first
                    </p>
                  </div>
                )}

                {formData.department && (
                  <div className="slots-container">
                    {isHoliday && !isLoadingSlots ? (
                      <div className="text-center py-8 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-2xl mb-2">🚫</p>
                        <h3 className="text-red-700 font-bold">Clinic Closed</h3>
                        <p className="text-red-600 text-sm">No appointments on this date.</p>
                      </div>
                    ) : (
                      <>
                        {!isLoadingSlots && filteredSlots.length > 0 && (
                          <div className="flex gap-2 mb-3 flex-wrap">
                            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 font-semibold">
                              ✅ Available: {slotStats.available}
                            </span>
                            <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 font-semibold">
                              🔴 Booked: {slotStats.booked}
                            </span>
                            
                            {/* Show indicator if slots were filtered */}
                            {slotStats.hidden > 0 && (
                              <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-semibold">
                                ⏰ Past slots hidden: {slotStats.hidden}
                              </span>
                            )}
                          </div>
                        )}

                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                          {formData.department} — Slots for {formData.date}
                        </label>

                        {isLoadingSlots ? (
                          <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-3"></div>
                            <p className="text-gray-400 text-sm">Loading slots...</p>
                          </div>
                        ) : filteredSlots.length === 0 ? (
                          <div className="text-center py-6 text-red-500 bg-red-50 rounded-lg border border-red-100">
                            <p className="font-semibold">No slots available</p>
                            <p className="text-xs text-red-400 mt-1">
                              {safeSlots.length > 0 
                                ? 'All slots for today have passed. Try another date.' 
                                : 'Select another date.'}
                            </p>
                          </div>
                        ) : (
                          <div className="slots-list">
                            {filteredSlots.map((slot, index) => {
                              const isBooked = slot.status === 'booked';
                              const isClosed = slot.status === 'closed';
                              const isPast = isSlotInPast(slot.time, formData.date);
                              const isUnavailable = isBooked || isClosed || isPast;
                              const isSelected = formData.time === slot.time;

                              return (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleSlotClick(slot)}
                                  disabled={isUnavailable}
                                  className={`
                                    relative py-3 px-2 rounded-xl text-sm font-medium
                                    transition-all duration-200 border-2
                                    ${
                                      isUnavailable
                                        ? 'text-gray-400 cursor-not-allowed border-gray-200 opacity-60'
                                        : isSelected
                                          ? 'bg-green-600 text-white border-green-600 shadow-lg transform scale-105 ring-2 ring-green-300'
                                          : 'bg-white text-gray-700 border-gray-200 hover:border-green-500 hover:text-green-600 hover:shadow-md'
                                    }
                                  `}
                                >
                                  {slot.time}
                                  {isSelected && (
                                    <span className="block text-[10px] text-green-100 font-bold mt-0.5">
                                      ✓ Selected
                                    </span>
                                  )}
                                  {isPast && !isBooked && (
                                    <span className="block text-[9px] text-gray-400 mt-0.5">
                                      Past
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* File Upload (Online only) */}
              {formData.appointmentType === 'Online' && (
                <div className="animate-fade-in-down">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medical Reports (Online) *
                  </label>
                  {!formData.file ? (
                    <label className="file-label block w-full p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 cursor-pointer transition-all text-center h-20 flex items-center justify-center text-blue-700 font-medium">
                      📎 Upload Reports (.pdf, .jpg) — Max 5MB
                      <input
                        type="file"
                        name="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleChange}
                        className="hidden"
                        required
                      />
                    </label>
                  ) : (
                    <div className="file-preview">
                      <div className="file-preview-info">
                        <span className="file-preview-icon">
                          {formData.fileType.includes('pdf') ? '📄' : '🖼️'}
                        </span>
                        <div className="file-preview-details">
                          <p className="file-preview-name">{formData.fileName}</p>
                          <p className="file-preview-size">
                            {(formData.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button type="button" className="file-remove-btn" onClick={removeFile}>
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Health Concern */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Health Concern (Optional)
                </label>
                <textarea
                  rows="3"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl outline-none"
                  placeholder="Describe your health concern..."
                />
              </div>

              {/* Payment Summary (Online only) */}
              {formData.appointmentType === 'Online' && (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid #86EFAC',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '800',
                      color: '#166534',
                      margin: '0 0 16px',
                    }}
                  >
                    🧾 Payment Summary
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#374151',
                    }}
                  >
                    <span>{formData.department || 'Department'} — Online Consultation</span>
                    <span style={{ fontWeight: '600' }}>₹{CONSULTATION_FEES.Online}</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '2px dashed #86EFAC', margin: '12px 0' }} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '22px',
                      fontWeight: '800',
                      color: '#065F46',
                    }}
                  >
                    <span>Total Payable</span>
                    <span>₹{CONSULTATION_FEES.Online}</span>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting || paymentLoading}
                  className="rounded-xl font-bold text-lg shadow-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      formData.appointmentType === 'Online'
                        ? 'linear-gradient(135deg, #6B0000, #6B0000)'
                        : 'linear-gradient(135deg, #059669, #047857)',
                    fontSize: '17px',
                    color: 'white',
                    fontFamily: 'roboto',
                    padding: '14px 40px',
                    letterSpacing: '0.3px',
                    minWidth: '250px',
                  }}
                >
                  {isSubmitting || paymentLoading
                    ? '⏳ Processing...'
                    : formData.appointmentType === 'Online'
                      ? `💳 Pay ₹${CONSULTATION_FEES.Online} & Book`
                      : '📅 Request Appointment'}
                </button>
              </div>

              {formData.appointmentType === 'Online' && (
                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#9CA3AF',
                    marginTop: '6px',
                    lineHeight: '1.5',
                  }}
                >
                  🔒 Secured by Razorpay | 256-bit SSL Encryption
                  <br />
                  UPI (GPay, PhonePe, Paytm) + QR Code + Card + NetBanking
                </p>
              )}
            </div>
          </form>

          {/* ===== RIGHT: INFO PANEL ===== */}
          <div className="booking-info">
            <h2>🩺 Consultation Process</h2>
            <div className="animate-fade-in mb-8">
              <div className="booking-process-step">
                <div className="process-icon">🏥</div>
                <div className="process-text">Select Department</div>
              </div>
              <div className="booking-process-step">
                <div className="process-icon">📍</div>
                <div className="process-text">Select Date & Time</div>
              </div>
              {formData.appointmentType === 'Online' && (
                <>
                  <div className="booking-process-step">
                    <div className="process-icon">💳</div>
                    <div className="process-text">
                      Pay ₹{CONSULTATION_FEES.Online} via UPI / Card / NetBanking
                    </div>
                  </div>
                  <div className="booking-process-step">
                    <div className="process-icon">📱</div>
                    <div className="process-text">
                      Card / QR / UPI
                    </div>
                  </div>
                </>
              )}
              <div className="booking-process-step">
                <div className="process-icon">✅</div>
                <div className="process-text">Get Confirmation Email</div>
              </div>
              {formData.appointmentType === 'Online' && (
                <div className="booking-process-step">
                  <div className="process-icon">📹</div>
                  <div className="process-text">Receive Zoom Meeting Link</div>
                </div>
              )}
            </div>

            {/* UPI Apps Showcase */}
            {formData.appointmentType === 'Online' && (
              <div
                style={{
                  background: '#F0FDF4',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #BBF7D0',
                  marginTop: '16px',
                }}
              >
                <p style={{ fontWeight: '700', fontSize: '14px', color: '#166534', margin: '0 0 10px' }}>
                  📲 Supported UPI Apps
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { name: 'Google Pay', emoji: '🟢' },
                    { name: 'PhonePe', emoji: '🟣' },
                    { name: 'Paytm', emoji: '🔵' },
                    { name: 'BHIM UPI', emoji: '🟠' },
                    { name: 'Amazon Pay', emoji: '🟡' },
                    { name: 'CRED', emoji: '⚫' },
                    { name: 'WhatsApp Pay', emoji: '🟢' },
                    { name: 'Any UPI App', emoji: '📱' },
                  ].map((app) => (
                    <div
                      key={app.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#374151',
                        fontWeight: '500',
                      }}
                    >
                      <span>{app.emoji}</span>
                      <span>{app.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}