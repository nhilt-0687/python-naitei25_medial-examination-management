import type { Services, ServiceType, OrderStatus } from './services';

// Define the service order interface
export interface ServiceOrder {
  orderId: number;
  serviceId: number;
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
