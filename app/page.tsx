'use client';
import { useEffect, useState } from 'react';

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  metafields: { key: string; value: string }[];
};

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);
  // const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [shipToCode, setShipToCode] = useState('');
  const [navisionAccount, setNavisionAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/customers?cursor=${cursor ?? ''}`);
        const data = await res.json();

        if (data.customers) {
          setCustomers(data.customers);
          setHasNextPage(data.pageInfo?.hasNextPage || false);
          setEndCursor(data.endCursor || null);
        }
        // setCustomers(data.customers);
        // setNextCursor(data.endCursor ?? null);
      } finally {
        setIsLoading(false);
      }
     
    };
    fetchData();
  }, [cursor]);

  const goToNext = () => {
  //   if (nextCursor) {
  //     setPrevCursors(prev => [...prev, cursor ?? '']);
  //     setCursor(nextCursor);
  //   }
  // };
    if (endCursor) {
      setPrevCursors(prev => [...prev, cursor ?? '']);
      setCursor(endCursor);
    }
  };

  const goToPrev = () => {
    // const lastCursor = prevCursors[prevCursors.length - 1];
    // setPrevCursors(prev => prev.slice(0, -1));
    // setCursor(lastCursor || null);
    if (prevCursors.length > 0) {
      const newPrevCursors = [...prevCursors];
      const prevCursor = newPrevCursors.pop() || null;
      setPrevCursors(newPrevCursors);
      setCursor(prevCursor || null);
    }
  };

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
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.first_name} {customer.last_name}</td>
              <td>{customer.email}</td>
              <td>{customer.metafields.find(m => m.key === 'ship_to_code')?.value || 'N/A'}</td>
              <td>{customer.metafields.find(m => m.key === 'navision_account')?.value || 'N/A'}</td>
              <td>
                <button
                  onClick={() => {
                    setEditingCustomer(customer);
                    setShipToCode(customer.metafields.find(m => m.key === 'ship_to_code')?.value || '');
                    setNavisionAccount(customer.metafields.find(m => m.key === 'navision_account')?.value || '');
                  }}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {/* <div className="flex gap-4 mt-4">
        <button disabled={prevCursors.length === 0} onClick={goToPrev}>Previous</button>
        <button disabled={!nextCursor} onClick={goToNext}>Next</button>
      </div> */}

      <div className="flex gap-4 mt-4">
        <button 
          disabled={prevCursors.length === 0} 
          onClick={goToPrev}
          className={`px-4 py-2 rounded ${prevCursors.length === 0 ? 'bg-gray-300 cursors-not-allowed' : 'bg-blue-500 text-white'}`}
        >
          Previous
        </button>
        <button 
          disabled={!hasNextPage} 
          onClick={goToNext}
          className={`px-4 py-2 rounded ${!hasNextPage ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
        >
          Next
        </button>
        <div className="mt-2 text-sm text-gray-600">
          Page {prevCursors.length + 1} • {customers.length} customers shown
        </div>
      </div>

      {/* Modal */}
      {editingCustomer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setEditingCustomer(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-md w-[400px]"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-black">Editing: {editingCustomer.first_name} {editingCustomer.last_name}</h3>

            <div className="mb-4">
              <label className="block mb-1 text-sm text-black">Ship To Code:</label>
              <input
                type="text"
                value={shipToCode}
                onChange={e => setShipToCode(e.target.value)}
                className="w-full px-2 py-1 border rounded text-black"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm text-black">Navision Account:</label>
              <input
                type="text"
                value={navisionAccount}
                onChange={e => setNavisionAccount(e.target.value)}
                className="w-full px-2 py-1 border rounded text-black"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 text-black px-3 py-1 rounded"
                onClick={() => setEditingCustomer(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={async () => {
                  await Promise.all([
                    fetch('/api/customers/update-metafield', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        customerId: editingCustomer.id,
                        key: 'ship_to_code',
                        value: shipToCode,
                        namespace: 'custom',
                        type: 'single_line_text_field'
                      })
                    }),
                    fetch('/api/customers/update-metafield', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        customerId: editingCustomer.id,
                        key: 'navision_account',
                        value: navisionAccount,
                        namespace: 'custom',
                        type: 'single_line_text_field'
                      })
                    })
                  ]);

                  setCustomers(prev =>
                    prev.map(c =>
                      c.id === editingCustomer.id
                        ? {
                            ...c,
                            metafields: (() => {
                              const updated = [...c.metafields];
                              const upsert = (key: string, value: string) => {
                                const existing = updated.find(m => m.key === key);
                                if (existing) existing.value = value;
                                else updated.push({ key, value });
                              };
                              upsert('ship_to_code', shipToCode);
                              upsert('navision_account', navisionAccount);
                              return updated;
                            })()
                          }
                        : c
                    )
                  );

                  setEditingCustomer(null);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
