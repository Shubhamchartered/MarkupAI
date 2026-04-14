"use client";

import { Buildings, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function IncomeTaxDashboard() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '2rem', background: 'var(--bg)', padding: '2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}><Buildings weight="duotone" color="var(--success-color)" /></div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Income Tax Dashboard</h1>
        <p style={{ color: 'var(--text-soft)', maxWidth: '400px' }}>
          The Income Tax module is currently under development. ITR management, assessments, and IT notices will be available here soon.
        </p>
      </div>
      <Link href="/select-module" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Module Selection
      </Link>
    </div>
  );
}
