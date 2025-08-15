import type { Services, ServiceType, OrderStatus } from './services';

// Define the service order interface
export interface ServiceOrder {
  orderId?: number;
  appointmentId?: number;
  roomId?: number;
  serviceId?: number;
  serviceName?: string;
  service_name?: string;
  price?: number | string;
  orderStatus?: string;
  result?: string;
  number?: number;
  orderTime?: string;
  order_time?: string;
  resultTime?: string;
  result_time?: string;
  createdAt?: string;
  created_at?: string;
  resultFileUrl?: string;
  result_file_url?: string;
  resultFilePublicId?: string;
  result_file_public_id?: string;
  service?: any;
}

// Define the request structure for creating a service order
export interface CreateServiceOrderRequest {
  serviceId: number;
  appointmentId: number;
  roomId: number;
}

// Define the data transfer object for service order
export interface ServiceOrderDto {
  orderId: number;
  appointmentId: number;
  roomId: number;
  service: Services;
  orderStatus: OrderStatus;
  result: string;
  number: number;
  orderTime: string;  
  resultTime: string; 
  createdAt: string;  
}
