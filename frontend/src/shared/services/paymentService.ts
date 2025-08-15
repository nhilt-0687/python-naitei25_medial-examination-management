import { api } from './api'; // Giữ nguyên import này theo cấu trúc của bạn
import { storage } from '../utils/storage';
import { LocalStorageKeys } from '../constants/storageKeys';
import { patientService } from './patientService';
import type { Appointment } from '../types/appointment'; 

const paymentService = {
  // Cập nhật hàm để nhận 'price' thay vì 'consultationFee'
  async createBillFromAppointment(appointmentId: number, patientId: number, price: number) {
    if (isNaN(price) || price <= 0) {
      throw new Error('Giá khám không hợp lệ hoặc bằng 0');
    }

    const totalCost = price;
    const insuranceDiscount = price * 0.1; 
    const amount = totalCost - insuranceDiscount;

    const payload = {
      appointment_id: appointmentId,
      patient_id: patientId,
      total_cost: totalCost,
      insurance_discount: insuranceDiscount,
      amount: amount,
      status: 'U', 
      bill_details: [] 
    };

    console.log('Gửi payload đến /bills/:', payload);

    try {
      const response = await api.post('/bills/', payload);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi tạo hóa đơn:', error.response?.data || error.message);
      throw error;
    }
  },

  async createPaymentLink(billId: number) {
    try {
      const response = await api.post(`/transactions/create-payment/${billId}/`);
      return response.data.data;
    } catch (error: any) {
      console.error('Lỗi khi tạo link thanh toán:', error.response?.data || error.message);
      throw error;
    }
  },

  // ĐÃ SỬA ĐỔI Ở ĐÂY: Sử dụng orderCode trong URL path nếu có
  async getPaymentInfo(billId: number, orderCode?: string) {
    try {
      let endpoint: string;
      if (orderCode) {
        // Nếu có orderCode (từ callback của PayOS), sử dụng nó trong đường dẫn
        endpoint = `/transactions/payment-info/${orderCode}/`;
      } else {
        // Ngược lại, sử dụng billId (ví dụ: khi tra cứu hóa đơn trực tiếp)
        endpoint = `/transactions/payment-info/${billId}/`;
      }
      
      // Không cần query params nếu định danh đã nằm trong đường dẫn
      const response = await api.get(endpoint);
      console.log('Payment info response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin thanh toán:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đã sửa: Thay đổi billId thành orderCode và sử dụng orderCode trong URL path
  async updatePaymentStatus(orderCode: string, status: 'success' | 'cancel', paymentData?: any) {
    try {
      const endpoint = status === 'success' 
        ? `/transactions/${orderCode}/success/` // Sử dụng orderCode trực tiếp
        : `/transactions/${orderCode}/cancel/`; // Sử dụng orderCode trực tiếp
      const payload = {
        orderCode: paymentData?.orderCode,
        status: paymentData?.status,
        payosCode: paymentData?.payosCode,
        payosId: paymentData?.payosId,
        timestamp: new Date().toISOString()
      };
      console.log(`Cập nhật payment status cho order ${orderCode}:`, payload);
      const response = await api.post(endpoint, payload);
      console.log('Update payment status response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi cập nhật payment status:', error.response?.data || error.message);
      throw error;
    }
  },

  async verifyPaymentStatus(billId: number, orderCode?: string) {
    try {
      const params = orderCode ? { orderCode } : {};
      const response = await api.get(`/transactions/verify/${billId}/`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi verify payment:', error.response?.data || error.message);
      throw error;
    }
  },

  async getPaymentStatus(billId: number) {
    try {
      const response = await api.get(`/transactions/status/${billId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Lỗi khi lấy payment status:', error.response?.data || error.message);
      throw error;
    }
  },

  async retryPayment(billId: number) {
    try {
      const response = await api.post(`/transactions/retry-payment/${billId}/`);
      return response.data.data;
    } catch (error: any) {
      console.error('Lỗi khi retry payment:', error.response?.data || error.message);
      throw error;
    }
  },
};

export { paymentService };
