/**
 * Tipos TypeScript para Domínios Customizados
 */

export type DomainMode = 'branding' | 'routing';

export interface CustomDomain {
  id: number;
  user_id: string;
  domain: string;
  verified: boolean;
  verification_token: string;
  mode: DomainMode;
  created_at: string;
  verified_at: string | null;
}

export interface CustomDomainStats extends CustomDomain {
  qr_codes_count: number;
  total_scans: number;
}

export interface DomainVerificationResult {
  success: boolean;
  message: string;
  records?: {
    type: string;
    name: string;
    value: string;
    ttl?: number;
  }[];
}

export interface CreateDomainRequest {
  domain: string;
}

export interface VerifyDomainRequest {
  domain_id: number;
}

export interface DeleteDomainRequest {
  domain_id: number;
}
