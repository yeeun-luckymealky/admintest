'use client';

import React from 'react';
import { Card, Row, Col } from 'antd';

interface StatusCardItem {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface StatusCardsProps {
  items: StatusCardItem[];
  selectedStatus: string | null;
  onStatusClick: (status: string | null) => void;
}

export default function StatusCards({ items, selectedStatus, onStatusClick }: StatusCardsProps) {
  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      {items.map((item) => (
        <Col key={item.label} flex="1">
          <Card
            hoverable
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              borderColor: selectedStatus === item.label || (selectedStatus === null && item.label === '전체')
                ? item.borderColor
                : '#f0f0f0',
              borderWidth: selectedStatus === item.label || (selectedStatus === null && item.label === '전체')
                ? 2
                : 1,
              backgroundColor: selectedStatus === item.label || (selectedStatus === null && item.label === '전체')
                ? item.bgColor
                : '#fff',
            }}
            bodyStyle={{ padding: '16px 8px' }}
            onClick={() => onStatusClick(item.label === '전체' ? null : item.label)}
          >
            <div style={{
              color: item.color,
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 4
            }}>
              {item.label}
            </div>
            <div style={{
              fontSize: 28,
              fontWeight: 700,
              color: item.color,
            }}>
              {item.count.toLocaleString()}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// 가게 상태 카드 데이터 생성 함수
export function getStoreStatusCards(counts: Record<string, number>): StatusCardItem[] {
  return [
    { label: '전체', count: counts.total, color: '#333', bgColor: '#f9f9f9', borderColor: '#333' },
    { label: '작성중', count: counts.작성중, color: '#d48806', bgColor: '#fffbe6', borderColor: '#fadb14' },
    { label: '심사중', count: counts.심사중, color: '#d46b08', bgColor: '#fff7e6', borderColor: '#fa8c16' },
    { label: '심사완료', count: counts.심사완료, color: '#389e0d', bgColor: '#f6ffed', borderColor: '#52c41a' },
    { label: '임시휴무', count: counts.임시휴무, color: '#0891b2', bgColor: '#e6fffb', borderColor: '#13c2c2' },
    { label: '탈퇴', count: counts.탈퇴, color: '#cf1322', bgColor: '#fff1f0', borderColor: '#f5222d' },
  ];
}

// 정산 상태 카드 데이터 생성 함수
export function getSettlementStatusCards(counts: Record<string, number>): StatusCardItem[] {
  return [
    { label: '전체', count: counts.total, color: '#333', bgColor: '#f9f9f9', borderColor: '#333' },
    { label: '정산대기', count: counts.정산대기, color: '#d46b08', bgColor: '#fff7e6', borderColor: '#fa8c16' },
    { label: '정산완료', count: counts.정산완료, color: '#389e0d', bgColor: '#f6ffed', borderColor: '#52c41a' },
    { label: '정산보류', count: counts.정산보류, color: '#d48806', bgColor: '#fffbe6', borderColor: '#fadb14' },
    { label: '정산취소', count: counts.정산취소, color: '#cf1322', bgColor: '#fff1f0', borderColor: '#f5222d' },
  ];
}
