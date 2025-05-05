import axios from 'axios';

const createPaymentLink = async ({ amount, description, name }) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/payment-links/create/', {
      amount,
      description,
      name
    });

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return {
      success: true,
      paymentUrl: response.data.paymentUrl || response.data.url,
      message: 'Payment link created successfully'
    };
  } catch (error) {
    console.error('Error creating payment link:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create payment link');
  }
};

export default createPaymentLink;