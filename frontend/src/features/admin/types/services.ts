export interface Services {
  serviceId: number;
  serviceName: string;
  serviceType: ServiceType;
  price: number;
  createdAt: string; 
  serviceOrders: ServiceOrder[];
}

// Define the possible service types
export type ServiceType = 'TEST' | 'IMAGING' | 'CONSULTATION' | 'OTHER';

// Forward declaration to resolve circular dependency with ServiceOrder
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

// Define the possible order statuses
export type OrderStatus = 'ORDERED' | 'COMPLETED';
