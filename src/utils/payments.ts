import type { PaymentProvider } from '../services/payment';

type PaymentStatus = 'pending' | 'completed' | 'failed';

export const PAYMENT_METHODS: Array<{
  id: PaymentProvider;
  title: string;
  subtitle: string;
}> = [
  {
    id: 'mtn_momo',
    title: 'MTN Mobile Money',
    subtitle: 'Hubtel will prompt you or dial *170# to approve',
  },
  {
    id: 'vodafone_cash',
    title: 'Vodafone Cash',
    subtitle: 'Hubtel routes payments through Vodafone Cash',
  },
  {
    id: 'airteltigo_money',
    title: 'AirtelTigo Money',
    subtitle: 'Approve the AirtelTigo prompt to complete payment',
  },
];

export const getProviderLabel = (provider: PaymentProvider) => {
  switch (provider) {
    case 'mtn_momo':
      return 'MTN Mobile Money';
    case 'vodafone_cash':
      return 'Vodafone Cash';
    case 'airteltigo_money':
      return 'AirtelTigo Money';
    default:
      return 'Mobile Money';
  }
};

export const mapPaymentStatus = (status?: string): PaymentStatus => {
  if (status === 'successful') return 'completed';
  if (status === 'failed') return 'failed';
  return 'pending';
};
