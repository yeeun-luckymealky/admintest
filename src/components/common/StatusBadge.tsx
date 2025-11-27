'use client';

import React from 'react';
import { Tag } from 'antd';
import type { StoreStatus, OrderStatus, SettlementStatus, CustomerStatus, ReviewStatus, ReportStatus } from '@/types';

type StatusType = StoreStatus | OrderStatus | SettlementStatus | CustomerStatus | ReviewStatus | ReportStatus;

interface StatusBadgeProps {
  status: StatusType;
}

const statusColorMap: Record<string, string> = {
  // 가게 상태
  '작성중': 'gold',
  '심사중': 'orange',
  '심사완료': 'green',
  '임시휴무': 'cyan',
  '탈퇴': 'red',

  // 주문 상태
  '주문시도': 'default',
  '예약완료': 'blue',
  '픽업확정': 'green',
  '유저취소': 'orange',
  '가게취소': 'red',
  '관리자취소': 'magenta',

  // 정산 상태
  '정산대기': 'orange',
  '정산완료': 'green',
  '정산보류': 'gold',
  '정산취소': 'red',

  // 고객 상태
  '정상': 'green',
  '블랙리스트': 'red',

  // 리뷰 상태
  '숨김': 'orange',
  '삭제': 'red',

  // 신고 상태
  '접수': 'default',
  '처리중': 'blue',
  '블랙': 'red',
  '해제': 'green',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Tag color={statusColorMap[status] || 'default'}>
      {status}
    </Tag>
  );
}
