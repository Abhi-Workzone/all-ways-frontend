'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { FiArrowRight, FiStar, FiShield, FiClock, FiCheckCircle } from 'react-icons/fi';

const services = [
  { icon: '🧹', name: 'Home Cleaning', desc: 'Deep cleaning & maintenance for a spotless home', active: true },
  { icon: '❄️', name: 'AC Service', desc: 'Expert AC repair, servicing & installation', active: true },
  { icon: '🔧', name: 'Plumbing', desc: 'Professional plumbing solutions for every need', coming: true },
  { icon: '⚡', name: 'Electrician', desc: 'Certified electrical repairs & installations', coming: true },
  { icon: '🎨', name: 'Painting', desc: 'Premium interior & exterior painting services', coming: true },
  { icon: '🐛', name: 'Pest Control', desc: 'Safe & effective pest management solutions', coming: true },
];

const steps = [
  { step: '01', title: 'Choose Service', desc: 'Browse our range of professional home services', icon: '🎯' },
  { step: '02', title: 'Book Appointment', desc: 'Select your preferred date, time & share details', icon: '📅' },
  { step: '03', title: 'Get It Done', desc: 'Verified professionals arrive at your doorstep', icon: '✅' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Homeowner', text: 'Absolutely stellar cleaning service! The team was thorough, punctual, and left my home sparkling. Will definitely book again.', rating: 5 },
  { name: 'Rahul Verma', role: 'Apartment Owner', text: 'AC service was quick and professional. The technician explained everything clearly. Best service platform I have used.', rating: 5 },
  { name: 'Anita Desai', role: 'Working Professional', text: 'Love how easy it is to book services. The app experience is smooth and the service quality is consistently excellent.', rating: 5 },
];

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Home() {
  return (
    <main className="animated-gradient min-h-screen w-full flex flex-col flex-grow overflow-x-hidden">
      <Navbar />

      {/* ==================== HERO ==================== */}
      <section className="relative min-h-screen w-full flex items-center justify-center grid-pattern overflow-hidden pt-20">
        {/* Background orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#6C63FF] rounded-full opacity-10 blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF6B9D] rounded-full opacity-10 blur-[120px]" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF] rounded-full opacity-5 blur-[200px]" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(108,99,255,0.1)] border border-[rgba(108,99,255,0.3)] mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              <span className="text-sm text-[#8888aa]">Trusted by 10,000+ homeowners</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              Home Services,{' '}
              <span className="gradient-text">Reimagined</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#8888aa] mb-10 leading-relaxed">
              Book premium home services with verified professionals. From deep cleaning to AC repairs &mdash; we&apos;ve got you covered, <span className="text-white font-medium">always</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg !py-4 !px-8 flex items-center gap-2 glow-primary"
                >
                  Book a Service <FiArrowRight />
                </motion.button>
              </Link>
              <Link href="/#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-lg !py-4 !px-8"
                >
                  How It Works
                </motion.button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { label: 'Happy Clients', value: '10K+' },
                { label: 'Services Done', value: '50K+' },
                { label: 'Rating', value: '4.9★' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text-primary">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-[#666680] mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[rgba(108,99,255,0.3)] flex justify-center pt-2">
            <div className="w-1 h-3 rounded-full bg-[#6C63FF]" />
          </div>
        </motion.div>
      </section>

      {/* ==================== SERVICES ==================== */}
      <section id="services" className="py-24 relative w-full flex justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase text-[#6C63FF]">Our Services</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
              What We <span className="gradient-text">Offer</span>
            </h2>
            <p className="max-w-xl mx-auto text-[#8888aa]">
              Professional services delivered by verified experts right to your doorstep
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`card relative group cursor-pointer ${service.coming ? 'opacity-70' : ''}`}
              >
                {service.coming && (
                  <div className="absolute top-4 right-4 badge badge-coming-soon text-xs">
                    Coming Soon
                  </div>
                )}
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-[#6C63FF] transition-colors">
                  {service.name}
                </h3>
                <p className="text-[#8888aa] text-sm leading-relaxed">{service.desc}</p>
                {service.active && (
                  <div className="mt-4 flex items-center gap-1 text-[#6C63FF] text-sm font-medium group-hover:gap-2 transition-all">
                    Book Now <FiArrowRight />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ABOUT / FEATURES ==================== */}
      <section className="py-24 relative w-full flex justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(108,99,255,0.03)] to-transparent" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase text-[#FF6B9D]">Why allWays?</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
              We{`'`}re <span className="gradient-text">Different</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FiShield className="text-[#6C63FF]" size={28} />, title: 'Verified Pros', desc: 'Background-checked and trained professionals' },
              { icon: <FiStar className="text-[#FF6B9D]" size={28} />, title: 'Top Quality', desc: 'Premium service with satisfaction guarantee' },
              { icon: <FiClock className="text-[#00D4AA]" size={28} />, title: 'On Time', desc: 'Punctual service, every single time' },
              { icon: <FiCheckCircle className="text-[#FFB74D]" size={28} />, title: 'Fair Pricing', desc: 'Transparent pricing with no hidden charges' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[rgba(108,99,255,0.1)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                <p className="text-sm text-[#8888aa]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="py-24 relative w-full flex justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase text-[#00D4AA]">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="max-w-xl mx-auto text-[#8888aa]">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                {...stagger}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="card text-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black text-[rgba(108,99,255,0.08)]">
                    {item.step}
                  </div>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-[#8888aa]">{item.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-[#6C63FF]">
                    <FiArrowRight size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section id="testimonials" className="py-24 relative w-full flex justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(255,107,157,0.03)] to-transparent" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider uppercase text-[#FFB74D]">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-4">
              What People <span className="gradient-text">Say</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                {...stagger}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} className="text-[#FFB74D] fill-[#FFB74D]" size={16} />
                  ))}
                </div>
                <p className="text-[#8888aa] text-sm leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-[#666680]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-24 w-full flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="relative overflow-hidden rounded-3xl p-12 sm:p-16 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF] to-[#5046E5]" />
            <div className="absolute inset-0 opacity-20 grid-pattern" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Join thousands of happy homeowners and experience premium home services today.
              </p>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-[#5046E5] font-bold py-4 px-10 rounded-xl hover:shadow-2xl transition-all text-lg"
                >
                  Get Started Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
