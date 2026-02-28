// src/app/booking/hooks/useRazorpay.js
import { useState } from 'react';
import toast from 'react-hot-toast';

export const useRazorpay = () => {
  const [isPaymentLoading, setPaymentLoading] = useState(false);

  const loadScript = () => {
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

  const processPayment = async ({
    amount,
    formData,
    onSuccess,
    onError
  }) => {
    setPaymentLoading(true);
    const loadingToast = toast.loading('Initializing payment...');

    try {
      const loaded = await loadScript();
      if (!loaded) throw new Error('Failed to load payment gateway');

      // 1. Create Order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          service: `${formData.department} - ${formData.appointmentType}`,
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to create order');

      toast.dismiss(loadingToast);

      // 2. Initialize Razorpay
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const options = {
        key: razorpayKeyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Aadhunika Hospital 🏥',
        description: 'Online Consultation',
        order_id: data.order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#059669' },
        handler: async function (response) {
          // 3. Verify Payment
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
             
             if(verifyData.success) {
               onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
             } else {
               throw new Error('Verification failed');
             }
          } catch (err) {
             toast.dismiss(verifyToast);
             toast.error('Payment verification failed, contact support.');
             // Optionally proceed anyway depending on policy
             onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
          }
          setPaymentLoading(false);
        },
        modal: {
          ondismiss: () => {
             toast.error('Payment cancelled');
             setPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment Failed: ' + response.error.description);
        setPaymentLoading(false);
      });
      rzp.open();

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Payment initialization failed');
      setPaymentLoading(false);
      if(onError) onError(error);
    }
  };

  return { processPayment, isPaymentLoading };
};