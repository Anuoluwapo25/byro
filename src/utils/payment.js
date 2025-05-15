import axios from 'axios';

const createPaymentLink = async ({ amount, description, name }) => {
  try {
    const response = await axios.post('https://bryo-dapp.onrender.com/api/payment-links/create/', {
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
    console.error(error)
    throw new Error(error.response?.data?.message || 'Failed to create payment link');
  }
};

export default createPaymentLink;