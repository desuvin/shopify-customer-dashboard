'use client';
import { useEffect, useState } from 'react';

type Customer = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  metafields: {
    key: string;
    value: string;
  }[];
};

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [shipToCode, setShipToCode] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [navisionAccount, setNavisionAccount] = useState('');

  useEffect(() => {
    setHasMounted(true);
    fetch('/api/customers')
      .then(res => res.json())
      .then(setCustomers);
  }, []);

  if (!hasMounted) return <p>Loading...</p>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Shopify Customers</h1>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-blue-300">
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Email</th>
            <th className="border px-3 py-2">Ship To Code</th>
            <th className="border px-3 py-2">Navision Account</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.first_name} {customer.last_name}</td>
              <td>{customer.email}</td>
              <td>
                {customer.metafields.find((m: any) => m.key === 'ship_to_code')?.value || 'N/A'}
              </td>
              <td>
                {customer.metafields.find((m: any) => m.key === 'navision_account')?.value || 'N/A'}
              </td>
              <td>
                <button onClick={() => {
                  setEditingCustomer(customer);
                  setShipToCode(customer.metafields.find((m: any) => m.key === 'ship_to_code')?.value || '');
                  setNavisionAccount(customer.metafields.find((m: any) => m.key === 'navision_account')?.value || '');
                }}>
                  Edit
                </button>
              </td>
            </tr>
          ))}

        </tbody>
      </table>
      {editingCustomer && (
        <div className='fixed  inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'
          onClick={() => setEditingCustomer(null)}
        >
          <div className="transition-transform transform scale-100 bg-white p-6 rounded shadow-md w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='text-lg font-semibold mb-4 text-black'>Editing: {editingCustomer.first_name} {editingCustomer.last_name}</h3>

            <div className='mb-4'>
              <label className='block mb-1 text-sm text-black'>
                Ship To Code:
                <input
                  type="text"
                  value={shipToCode}
                  onChange={(e) => setShipToCode(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-black"
                />
              </label>
            </div>

            <div className='mb-4'>
              <label className="block mb-1 text-sm text-black">
                Navision Account:
                <input
                  type="text"
                  value={navisionAccount}
                  onChange={(e) => setNavisionAccount(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-black"
                />
              </label>
            </div>

            <div className='flex justify-end gap-2'>
              <button 
                className='bg-gray-300 text-black px-3 py-1 rounded'
                onClick={() => setEditingCustomer(null)}>Cancel</button>

              <button 
                className='bg-blue-600 text-white px-3 py-1 rounded'
                onClick={async () => {
                await fetch('/api/customers/update-metafield', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customerId: editingCustomer.id,
                    key: 'ship_to_code',
                    value: shipToCode,
                    namespace: 'custom',
                    type: 'single_line_text_field'
                  })
                });

                await fetch('/api/customers/update-metafield', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customerId: editingCustomer.id,
                    key: 'navision_account',
                    value: navisionAccount,
                    namespace: 'custom',
                    type: 'single_line_text_field'
                  })
                });

                setCustomers(prev =>
                  prev.map(c =>
                    c.id === editingCustomer.id
                      ? {
                        ...c,
                        metafields: (() => {
                          const updated = [...c.metafields];
                          const updateOrInsert = (key: string, value: string) => {
                            const existing = updated.find(m => m.key === key);
                            if (existing) {
                              existing.value = value;
                            } else {
                              updated.push({ key, value });
                            }
                          };
                          updateOrInsert('ship_to_code', shipToCode);
                          updateOrInsert('navision_account', navisionAccount);
                          return updated;
                        })()
                      }
                      : c
                  )
                );
                setEditingCustomer(null);
              }}>
                Save
              </button>
            </div>

          </div>
        </div>

      )}

    </main>
  );
}
