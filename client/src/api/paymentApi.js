// src/api/paymentApi.js
import api from './config';

export const initiatePayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to initiate payment' };
  }
};

export const verifyPayment = async (verificationData) => {
  try {
    const response = await api.post('/payments/verify', verificationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to verify payment' };
  }
};

export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payment details' };
  }
};
