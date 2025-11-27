'use client';

import React, { useState } from 'react';
import { Card, Table, Input, Select, Button, Typography, Space, Row, Col, DatePicker, Modal, Descriptions, Tag, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockOrders } from '@/data/mockData';
import type { Order, OrderStatus } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const orderStatuses = ['전체', '주문시도', '예약완료', '픽업확정', '유저취소', '가게취소', '관리자취소'];

export default function OrdersPage() {
  // 필터 입력 상태
  const [phoneFilter, setPhoneFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // 실제 검색 조건 상태
  const [searchPhone, setSearchPhone] = useState('');
  const [searchStore, setSearchStore] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('전체');

  // 모달 상태
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredOrders = mockOrders.filter((order) => {
    if (searchPhone && !order.customerPhone.includes(searchPhone)) return false;
    if (searchStore && !order.storeName.includes(searchStore)) return false;
    if (searchStatus !== '전체' && order.status !== searchStatus) return false;
    return true;
  });

  const handleSearch = () => {
    setSearchPhone(phoneFilter);
    setSearchStore(storeFilter);
    setSearchStatus(statusFilter);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRowClick = (record: Order) => {
    setSelectedOrder(record);
    setModalOpen(true);
  };

  const handleCancelOrder = (type: 'partial' | 'full') => {
    if (type === 'partial') {
      message.success('부분 취소가 완료되었습니다.');
    } else {
      message.success('전체 취소가 완료되었습니다.');
    }
    setModalOpen(false);
  };

  const columns = [
    {
      title: '주문번호',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string, record: Order) => (
        <a onClick={() => handleRowClick(record)}>{text}</a>
      ),
    },
    {
      title: '주문일시',
      dataIndex: 'orderedAt',
      key: 'orderedAt',
    },
    {
      title: '고객명',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '전화번호',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
    },
    {
      title: '가게명',
      dataIndex: 'storeName',
      key: 'storeName',
    },
    {
      title: '금액',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString()}원`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => <StatusBadge status={status} />,
    },
    {
      title: '관리',
      key: 'action',
      render: (_: unknown, record: Order) => (
        <Button size="small" onClick={() => handleRowClick(record)}>상세</Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>주문 관리</Title>

      {/* 필터 영역 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle" wrap>
              <Input
                placeholder="휴대전화 번호"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ width: 180 }}
              />
              <Input
                placeholder="가게명"
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ width: 180 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={orderStatuses.map((s) => ({ label: s === '전체' ? '전체 상태' : s, value: s }))}
              />
              <RangePicker
                placeholder={['시작일', '종료일']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              검색
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 테이블 */}
      <Card>
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            total: filteredOrders.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
        />
      </Card>

      {/* 주문 상세 모달 */}
      <Modal
        title={`주문 상세 - ${selectedOrder?.orderNumber}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>닫기</Button>,
          selectedOrder && !['유저취소', '가게취소', '관리자취소'].includes(selectedOrder.status) && (
            <Button key="partial" onClick={() => handleCancelOrder('partial')}>부분 취소</Button>
          ),
          selectedOrder && !['유저취소', '가게취소', '관리자취소'].includes(selectedOrder.status) && (
            <Button key="full" danger onClick={() => handleCancelOrder('full')}>전체 취소</Button>
          ),
        ]}
      >
        {selectedOrder && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="주문번호">{selectedOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="주문일시">{selectedOrder.orderedAt}</Descriptions.Item>
              <Descriptions.Item label="고객명">{selectedOrder.customerName}</Descriptions.Item>
              <Descriptions.Item label="전화번호">{selectedOrder.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="가게명">{selectedOrder.storeName}</Descriptions.Item>
              <Descriptions.Item label="상태">
                <StatusBadge status={selectedOrder.status} />
              </Descriptions.Item>
            </Descriptions>

            <Card size="small" title="주문 상품">
              <Table
                size="small"
                dataSource={selectedOrder.items}
                columns={[
                  { title: '상품명', dataIndex: 'name', key: 'name' },
                  { title: '수량', dataIndex: 'quantity', key: 'quantity' },
                  { title: '단가', dataIndex: 'price', key: 'price', render: (v: number) => `${v.toLocaleString()}원` },
                  { title: '소계', key: 'subtotal', render: (_: unknown, r: { quantity: number; price: number }) => `${(r.quantity * r.price).toLocaleString()}원` },
                ]}
                pagination={false}
                rowKey="id"
              />
              <div style={{ textAlign: 'right', marginTop: 12 }}>
                <Text strong>총 금액: {selectedOrder.totalAmount.toLocaleString()}원</Text>
              </div>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
}
