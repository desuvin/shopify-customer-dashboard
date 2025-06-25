'use client';
import { useEffect, useState } from 'react';

type Customer = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Shopify Customers</h1>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="border px-3 py-2">{customer.id}</td>
              <td className="border px-3 py-2">{customer.first_name} {customer.last_name}</td>
              <td className="border px-3 py-2">{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
