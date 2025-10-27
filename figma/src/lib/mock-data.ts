import { User, Beehive } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'admin',
    email: 'admin@kbee.vn',
    business_name: 'Trang trại Ong Mật Việt',
    contact_info: '0901234567',
    created_at: new Date('2024-01-01').toISOString(),
  },
];

export const mockBeehives: Beehive[] = [
  {
    serial_number: 'TO001',
    qr_token: 'ABC123DEF456',
    import_date: '2024-01-15',
    split_date: '2024-02-20',
    health_status: 'Tốt',
    notes: 'Tổ ong phát triển tốt, sản xuất mật cao',
    is_sold: false,
    user_id: 'user-1',
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-01-15').toISOString(),
  },
  {
    serial_number: 'TO002',
    qr_token: 'GHI789JKL012',
    import_date: '2024-01-20',
    health_status: 'Bình thường',
    notes: 'Cần theo dõi thêm',
    is_sold: false,
    user_id: 'user-1',
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-01-20').toISOString(),
  },
  {
    serial_number: 'TO003',
    qr_token: 'MNO345PQR678',
    import_date: '2024-02-01',
    split_date: '2024-03-15',
    health_status: 'Tốt',
    notes: 'Đã tách đàn thành công',
    is_sold: false,
    user_id: 'user-1',
    created_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date('2024-02-01').toISOString(),
  },
  {
    serial_number: 'TO004',
    qr_token: 'STU901VWX234',
    import_date: '2024-02-10',
    health_status: 'Yếu',
    notes: 'Cần chăm sóc đặc biệt, bổ sung thức ăn',
    is_sold: false,
    user_id: 'user-1',
    created_at: new Date('2024-02-10').toISOString(),
    updated_at: new Date('2024-02-10').toISOString(),
  },
  {
    serial_number: 'TO005',
    qr_token: 'YZA567BCD890',
    import_date: '2024-03-01',
    health_status: 'Tốt',
    notes: 'Tổ ong mạnh, đã bán cho khách hàng',
    is_sold: true,
    sold_date: '2024-04-15',
    user_id: 'user-1',
    created_at: new Date('2024-03-01').toISOString(),
    updated_at: new Date('2024-04-15').toISOString(),
  },
];

export function generateQRToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function generateSerialNumber(beehives: Beehive[]): string {
  const maxNumber = beehives.reduce((max, b) => {
    const num = parseInt(b.serial_number.replace('TO', ''));
    return num > max ? num : max;
  }, 0);
  const newNumber = maxNumber + 1;
  return `TO${String(newNumber).padStart(3, '0')}`;
}
