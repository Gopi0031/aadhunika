'use client';

import { useState } from 'react';
import toast from 'react-hot-toast'; 
import { MapPin, Phone, Mail } from 'lucide-react'; // ✅ Import Icons

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('📤 Sending message...');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success('✅ Thank you! We will contact you shortly.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error('❌ ' + data.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Network error. Please try again.');
    }
  };

  return (
    <section className="contact-page">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-subtitle">
        Get in touch with Aadhunika Multispeciality Hospital for appointments,
        enquiries, or support.
      </p>

      <div className="contact-container">

        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send Us a Message</h2>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit" className="btn-primary">Submit</button>
        </form>

        {/* Contact Info with Icons */}
        <div className="contact-info">
          <h2>Hospital Information</h2>

          <div className="contact-item">
            <div className="icon-box"><MapPin size={24} /></div>
            <div>
              <h3>Address</h3>
              <p>Guntur, Andhra Pradesh, India-522002</p>
            </div>
          </div>

          <div className="contact-item">
            <div className="icon-box"><Phone size={24} /></div>
            <div>
              <h3>Phone</h3>
              <a href="tel:+916305650469" className="contact-link">+91 6305650469</a>
            </div>
          </div>

          <div className="contact-item">
            <div className="icon-box"><Mail size={24} /></div>
            <div>
              <h3>Email</h3>
              <a href="mailto:nagalakshmiakurathi.ak@gmail.com" className="contact-link">
                nagalakshmiakurathi.ak@gmail.com
              </a>
            </div>
          </div>

          <div className="contact-note">
            <p>
              Our team is available to assist you with appointments, medical
              enquiries, and emergency guidance.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}