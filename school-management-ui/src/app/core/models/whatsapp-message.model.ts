export interface WhatsAppMessageRequest {
  phoneNumbers: string[];
  message: string;
  title?: string;
}

export interface WhatsAppMessageResponse {
  success: boolean;
  message: string;
  sentCount: number;
  failedCount: number;
  failedNumbers: string[];
}

export interface ParentInfo {
  parentId: number;
  name: string;
  phone: string;
  email?: string;
}
