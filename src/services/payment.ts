// Payment service for Ghana Mobile Money integration
// Supports MTN Mobile Money, Vodafone Cash, and AirtelTigo Money

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  email?: string;
  description: string;
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string | null;
  reference?: string | null;
  checkoutUrl?: string | null;
  status: 'pending' | 'successful' | 'failed';
  message: string;
  data?: any;
}

export type PaymentProvider = 'mtn_momo' | 'vodafone_cash' | 'airteltigo_money';

interface HubtelCheckoutResponse {
  status?: string;
  message?: string;
  reference?: string;
  transactionId?: string;
  checkoutId?: string;
  checkoutUrl?: string;
  redirectUrl?: string;
  data?: any;
}

const normaliseStatus = (value?: string): 'pending' | 'successful' | 'failed' => {
  if (!value) return 'pending';
  const lower = value.toLowerCase();
  if (['success', 'successful', 'completed', 'paid'].includes(lower)) {
    return 'successful';
  }
  if (['failed', 'declined', 'cancelled', 'error'].includes(lower)) {
    return 'failed';
  }
  return 'pending';
};

export class PaymentService {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint ?? process.env.EXPO_PUBLIC_PAYMENTS_URL ?? '';
  }

  private ensureEndpoint() {
    if (!this.endpoint) {
      throw new Error(
        'Payment endpoint not configured. Set EXPO_PUBLIC_PAYMENTS_URL to your Hubtel checkout handler.'
      );
    }
  }

  async processPayment(
    provider: PaymentProvider,
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    this.ensureEndpoint();

    const payload = {
      provider,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      customerPhoneNumber: paymentRequest.phoneNumber,
      description: paymentRequest.description,
      reference: paymentRequest.reference,
      email: paymentRequest.email,
      callbackUrl: paymentRequest.callbackUrl,
      metadata: paymentRequest.metadata ?? {},
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json: HubtelCheckoutResponse = await response
        .json()
        .catch(() => ({} as HubtelCheckoutResponse));

      if (!response.ok) {
        return {
          success: false,
          status: 'failed',
          message: json?.message || 'Failed to initiate payment. Try again or contact support.',
          reference: json?.reference ?? paymentRequest.reference ?? null,
          transactionId: json?.transactionId ?? json?.checkoutId ?? null,
          checkoutUrl: json?.checkoutUrl ?? json?.redirectUrl ?? null,
          data: json,
        };
      }

      const status = normaliseStatus(json.status);

      return {
        success: status === 'successful',
        status,
        message: json?.message || 'Payment request sent via Hubtel. Approve the prompt to continue.',
        reference: json?.reference ?? paymentRequest.reference ?? null,
        transactionId: json?.transactionId ?? json?.checkoutId ?? null,
        checkoutUrl: json?.checkoutUrl ?? json?.redirectUrl ?? null,
        data: json,
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'failed',
        message:
          error?.message || 'Network error occurred while contacting the payment service. Please retry.',
        reference: paymentRequest.reference ?? null,
        transactionId: null,
      };
    }
  }

  detectProvider(phoneNumber: string): PaymentProvider | null {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (/^(233|0)?(24|54|55|59)/.test(cleanNumber)) {
      return 'mtn_momo';
    }

    if (/^(233|0)?(20|50)/.test(cleanNumber)) {
      return 'vodafone_cash';
    }

    if (/^(233|0)?(26|27|28|56|57)/.test(cleanNumber)) {
      return 'airteltigo_money';
    }

    return null;
  }

  formatGhanaianPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/[^0-9+]/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = `+233${cleaned.slice(1)}`;
    } else if (!cleaned.startsWith('+233')) {
      cleaned = `+233${cleaned}`;
    }

    return cleaned;
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const ghanaPattern = /^(\+233|0)[2-5]\d{8}$/;
    const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
    return ghanaPattern.test(cleaned);
  }
}

export const createPremiumUpgradePayment = (phoneNumber: string): PaymentRequest => {
  return {
    amount: 20.0,
    currency: 'GHS',
    phoneNumber,
    description: 'UMAT Hostels Premium Upgrade - One Year Access',
    reference: `PREMIUM_${Date.now()}`,
  };
};