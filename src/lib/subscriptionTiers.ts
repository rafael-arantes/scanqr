/**
 * Sistema de Tiers de Assinatura
 *
 * Este módulo gerencia a lógica de planos e limites do modelo Freemium.
 * Centraliza as regras de negócio relacionadas a assinaturas.
 */

// ========================================
// TIPOS
// ========================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface TierLimits {
  maxQrCodes: number;
  maxScansPerMonth: number | null; // null = ilimitado
  maxCustomDomains: number | null; // null = ilimitado, 0 = não permitido
  canCustomizeDomains: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
  supportLevel: 'community' | 'email' | 'priority';
}

// ========================================
// CONFIGURAÇÃO DOS PLANOS
// ========================================

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxQrCodes: 10,
    maxScansPerMonth: 1000,
    maxCustomDomains: 0,
    canCustomizeDomains: false,
    canAccessAnalytics: false,
    canExportData: false,
    supportLevel: 'community',
  },
  pro: {
    maxQrCodes: 100,
    maxScansPerMonth: 50000,
    maxCustomDomains: 3,
    canCustomizeDomains: true,
    canAccessAnalytics: true,
    canExportData: true,
    supportLevel: 'email',
  },
  enterprise: {
    maxQrCodes: 999999, // Praticamente ilimitado
    maxScansPerMonth: null, // Ilimitado
    maxCustomDomains: null, // Ilimitado
    canCustomizeDomains: true,
    canAccessAnalytics: true,
    canExportData: true,
    supportLevel: 'priority',
  },
};

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

/**
 * Obtém os limites de um plano específico
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Verifica se o usuário pode criar mais QR Codes
 */
export function canCreateQrCode(tier: SubscriptionTier, currentCount: number): boolean {
  const limits = getTierLimits(tier);
  return currentCount < limits.maxQrCodes;
}

/**
 * Verifica se o usuário atingiu o limite de scans mensais
 */
export function hasReachedScanLimit(tier: SubscriptionTier, monthlyScans: number): boolean {
  const limits = getTierLimits(tier);

  // Se o plano tem scans ilimitados
  if (limits.maxScansPerMonth === null) {
    return false;
  }

  return monthlyScans >= limits.maxScansPerMonth;
}

/**
 * Calcula quantos QR Codes ainda podem ser criados
 */
export function getRemainingQrCodes(tier: SubscriptionTier, currentCount: number): number {
  const limits = getTierLimits(tier);
  return Math.max(0, limits.maxQrCodes - currentCount);
}

/**
 * Calcula a porcentagem de uso do limite de QR Codes
 */
export function getQrCodeUsagePercentage(tier: SubscriptionTier, currentCount: number): number {
  const limits = getTierLimits(tier);
  return Math.min(100, (currentCount / limits.maxQrCodes) * 100);
}

/**
 * Retorna mensagem amigável sobre o status do limite
 */
export function getQrCodeLimitMessage(tier: SubscriptionTier, currentCount: number): string {
  const limits = getTierLimits(tier);

  // Enterprise has unlimited QR codes
  if (tier === 'enterprise') {
    return 'QR Codes ilimitados';
  }

  const remaining = getRemainingQrCodes(tier, currentCount);

  if (remaining === 0) {
    return `Você atingiu o limite de ${
      limits.maxQrCodes
    } QR Codes do plano ${tier.toUpperCase()}. Faça upgrade para criar mais!`;
  }

  if (remaining <= 2) {
    return `Atenção: Restam apenas ${remaining} QR Code(s) disponíveis no seu plano.`;
  }

  return `${remaining} de ${limits.maxQrCodes} QR Codes disponíveis`;
}

/**
 * Verifica se uma feature está disponível para o tier
 */
export function hasFeature(tier: SubscriptionTier, feature: keyof TierLimits): boolean {
  const limits = getTierLimits(tier);
  const value = limits[feature];

  // Para valores booleanos
  if (typeof value === 'boolean') {
    return value;
  }

  // Para outros valores, considera "truthy"
  return !!value;
}

/**
 * Compara dois tiers (útil para verificar upgrades)
 */
export function compareTiers(tier1: SubscriptionTier, tier2: SubscriptionTier): number {
  const hierarchy: Record<SubscriptionTier, number> = {
    free: 1,
    pro: 2,
    enterprise: 3,
  };

  return hierarchy[tier1] - hierarchy[tier2];
}

/**
 * Verifica se um tier é superior a outro
 */
export function isHigherTier(tier: SubscriptionTier, comparedTo: SubscriptionTier): boolean {
  return compareTiers(tier, comparedTo) > 0;
}

/**
 * Verifica se o usuário pode adicionar mais domínios customizados
 */
export function canAddCustomDomain(tier: SubscriptionTier, currentCount: number): boolean {
  const limits = getTierLimits(tier);

  // Se não permite domínios customizados
  if (!limits.canCustomizeDomains || limits.maxCustomDomains === 0) {
    return false;
  }

  // Se é ilimitado
  if (limits.maxCustomDomains === null) {
    return true;
  }

  // Verificar se não ultrapassou o limite
  return currentCount < limits.maxCustomDomains;
}

/**
 * Calcula quantos domínios customizados ainda podem ser adicionados
 */
export function getRemainingCustomDomains(tier: SubscriptionTier, currentCount: number): number {
  const limits = getTierLimits(tier);

  if (!limits.canCustomizeDomains || limits.maxCustomDomains === 0) {
    return 0;
  }

  if (limits.maxCustomDomains === null) {
    return 999999; // "Ilimitado"
  }

  return Math.max(0, limits.maxCustomDomains - currentCount);
}

/**
 * Retorna mensagem sobre limite de domínios customizados
 */
export function getCustomDomainLimitMessage(tier: SubscriptionTier, currentCount: number): string {
  const limits = getTierLimits(tier);

  if (!limits.canCustomizeDomains) {
    return `Domínios customizados não disponíveis no plano ${tier.toUpperCase()}. Faça upgrade para Pro!`;
  }

  if (limits.maxCustomDomains === null) {
    return 'Domínios customizados ilimitados';
  }

  const remaining = getRemainingCustomDomains(tier, currentCount);

  if (remaining === 0) {
    return `Você atingiu o limite de ${limits.maxCustomDomains} domínio(s) do plano ${tier.toUpperCase()}.`;
  }

  if (remaining === 1) {
    return `Atenção: Resta apenas 1 domínio disponível no seu plano.`;
  }

  return `${remaining} de ${limits.maxCustomDomains} domínios disponíveis`;
}

/**
 * Calcula quantos scans ainda podem ser feitos no mês
 */
export function getRemainingScans(tier: SubscriptionTier, currentMonthlyScans: number): number | null {
  const limits = getTierLimits(tier);

  // Ilimitado
  if (limits.maxScansPerMonth === null) {
    return null;
  }

  return Math.max(0, limits.maxScansPerMonth - currentMonthlyScans);
}

/**
 * Calcula a porcentagem de uso do limite mensal de scans
 */
export function getScansUsagePercentage(tier: SubscriptionTier, currentMonthlyScans: number): number {
  const limits = getTierLimits(tier);

  // Ilimitado = 0%
  if (limits.maxScansPerMonth === null) {
    return 0;
  }

  return Math.min(100, (currentMonthlyScans / limits.maxScansPerMonth) * 100);
}

/**
 * Retorna mensagem amigável sobre o status do limite de scans
 */
export function getScansLimitMessage(tier: SubscriptionTier, currentMonthlyScans: number): string {
  const limits = getTierLimits(tier);

  // Ilimitado
  if (limits.maxScansPerMonth === null) {
    return 'Scans ilimitados';
  }

  const remaining = getRemainingScans(tier, currentMonthlyScans);

  if (remaining === 0) {
    return `Limite de ${limits.maxScansPerMonth.toLocaleString('pt-BR')} scans mensais atingido! Faça upgrade para continuar.`;
  }

  if (remaining !== null && remaining <= 100) {
    return `Atenção: Restam apenas ${remaining.toLocaleString('pt-BR')} scans este mês.`;
  }

  return `${currentMonthlyScans.toLocaleString('pt-BR')} de ${limits.maxScansPerMonth.toLocaleString('pt-BR')} scans este mês`;
}
