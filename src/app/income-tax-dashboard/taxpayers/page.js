"use client";
import { redirect } from 'next/navigation';
export default function TaxpayersRedirect() {
  redirect('/income-tax-dashboard/notices');
}
