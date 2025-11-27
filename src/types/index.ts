// 가게 타입
export type StoreStatus = '작성중' | '심사중' | '심사완료' | '임시휴무' | '탈퇴';

export interface Store {
  id: string;
  name: string;
  region: string;
  category: string;
  registeredAt: string;
  status: StoreStatus;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  address?: string;
}

// 주문 타입
export type OrderStatus = '주문시도' | '예약완료' | '픽업확정' | '유저취소' | '가게취소' | '관리자취소';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderedAt: string;
  customerName: string;
  customerPhone: string;
  storeName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
}

// 고객 타입
export type CustomerStatus = '활성' | '탈퇴';

export interface Customer {
  id: string;
  nickname: string;
  phone: string;
  email?: string;
  registeredAt: string;
  mannerScore: number; // 80점 기본, 100점 최대 (정수)
  orderCount: number;
  status: CustomerStatus;
}

// 정산 타입
export type SettlementStatus = '정산대기' | '정산완료' | '정산보류' | '정산취소';

export interface Settlement {
  id: string;
  storeName: string;
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  totalSales: number;
  fee: number;
  settlementAmount: number;
  scheduledDate: string;
  status: SettlementStatus;
}

// 리뷰 타입
export type ReviewStatus = '정상' | '숨김' | '삭제';

export interface Review {
  id: string;
  storeName: string;
  customerPhone: string;
  orderDate: string;
  reviewDate: string;
  rating: number;
  content: string;
  status: ReviewStatus;
}

// 신고 타입
export type ReportType = '가게→고객' | '고객→가게';
export type ReportStatus = '접수' | '처리중' | '블랙' | '해제';

export interface Report {
  id: string;
  reportedAt: string;
  type: ReportType;
  reporter: string;
  reported: string;
  reason: string;
  status: ReportStatus;
}

// 대시보드 통계
export interface DashboardStats {
  todayOrders: number;
  todayOrdersChange: number;
  pendingStores: number;
  pendingReports: number;
  todayReviews: number;
}
