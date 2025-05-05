'use client';
import { useState } from 'react';
import createPaymentLink from '../../utils/payment.js';

export default function PaymentPage() {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    name: ''
  });
  const [paymentUrl, setPaymentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Basic validation for amount field
    if (name === 'amount' && value !== '') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        setError('Amount must be a positive number');
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user makes changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data
    if (!formData.amount || !formData.description || !formData.name) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await createPaymentLink(formData);
      setPaymentUrl(response.paymentUrl);
    } catch (err) {
      setError(err.message || 'Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Payment Link</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Enter description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Payer Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter payer name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Payment Link'}
        </button>
      </form>

      {paymentUrl && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 font-medium">Payment Link Created Successfully!</p>
          <a 
            href={paymentUrl} 
            className="text-blue-600 hover:text-blue-800 break-all mt-2 block"
            target="_blank"
            rel="noopener noreferrer"
          >
            {paymentUrl}
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
