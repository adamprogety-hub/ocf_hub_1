export type ConnectionStatus = 'online' | 'connecting' | 'standby' | 'error';

export type HardwareCategoryId = 'plc' | 'gateway' | 'scada' | 'smart_device';

export interface HardwareCategory {
  id: HardwareCategoryId;
  title: string;
  subtitle: string;
  description: string;
  totalNodes: number;
  onlineNodes: number;
}

export interface OpcConnection {
  id: string;
  categoryId: HardwareCategoryId;
  name: string;
  endpoint: string;
  tagsCount: number;
  protocol: string;
  pingMs: number;
  uptime: string;
  status: ConnectionStatus;
  securityPolicy: string;
  messageSecurityMode: 'SignAndEncrypt' | 'Sign' | 'None';
  controllerType: string;
  lastSync: string;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  endpoint: string;
  ip: string;
  manufacturer: string;
  tagsEstimated: number;
}
