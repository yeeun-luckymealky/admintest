'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, Descriptions, Tabs, Statistic, Table, Button, Space, Row, Col, Tag } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, EditOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockStores, mockOrders, mockReviews, mockSettlements } from '@/data/mockData';

const { Title, Text } = Typography;

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;

  const store = mockStores.find((s) => s.id === storeId);

  if (!store) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Title level={4}>가게를 찾을 수 없습니다.</Title>
        <Button type="primary" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>
    );
  }

  // 해당 가게의 주문 내역
  const storeOrders = mockOrders.filter((order) => order.storeName === store.name);

  // 해당 가게의 리뷰
  const storeReviews = mockReviews.filter((review) => review.storeName === store.name);

  // 해당 가게의 정산
  const storeSettlements = mockSettlements.filter((settlement) => settlement.storeName === store.name);

  // 통계 계산
  const totalSales = storeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const completedOrders = storeOrders.filter((o) => o.status === '픽업확정').length;
  const avgRating = storeReviews.length > 0
    ? (storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length).toFixed(1)
    : '-';

  const tabItems = [
    {
      key: 'info',
      label: '기본 정보',
      children: (
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="상호명">{store.name}</Descriptions.Item>
          <Descriptions.Item label="카테고리">{store.category}</Descriptions.Item>
          <Descriptions.Item label="지역">{store.region}</Descriptions.Item>
          <Descriptions.Item label="등록일">{store.registeredAt}</Descriptions.Item>
          <Descriptions.Item label="주소" span={2}>
            <EnvironmentOutlined /> {store.address || '주소 미등록'}
          </Descriptions.Item>
          <Descriptions.Item label="사장님 성함">{store.ownerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="연락처">
            <PhoneOutlined /> {store.ownerPhone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="이메일" span={2}>
            <MailOutlined /> {store.ownerEmail || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="현재 상태" span={2}>
            <StatusBadge status={store.status} />
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'stats',
      label: '통계',
      children: (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card size="small">
                <Statistic title="총 매출" value={totalSales} suffix="원" />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic title="완료 주문" value={completedOrders} suffix="건" />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic title="평균 평점" value={avgRating} suffix="점" />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic title="리뷰 수" value={storeReviews.length} suffix="개" />
              </Card>
            </Col>
          </Row>
          <Card size="small" style={{ marginTop: 16 }}>
            <Title level={5}>피크 타임</Title>
            <Text>오후 5시 ~ 7시 (전체 주문의 45%)</Text>
          </Card>
          <Card size="small" style={{ marginTop: 16 }}>
            <Title level={5}>지역 내 순위</Title>
            <Text>{store.region} 지역 내 매출 상위권</Text>
          </Card>
        </div>
      ),
    },
    {
      key: 'orders',
      label: `주문 내역 (${storeOrders.length})`,
      children: (
        <Table
          size="small"
          dataSource={storeOrders}
          columns={[
            { title: '주문번호', dataIndex: 'orderNumber', key: 'orderNumber' },
            { title: '고객', dataIndex: 'customerName', key: 'customerName' },
            { title: '주문일시', dataIndex: 'orderedAt', key: 'orderedAt' },
            { title: '금액', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `${v.toLocaleString()}원` },
            { title: '상태', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
          ]}
          pagination={{ pageSize: 5 }}
          rowKey="id"
          locale={{ emptyText: '주문 내역이 없습니다.' }}
        />
      ),
    },
    {
      key: 'reviews',
      label: `리뷰 (${storeReviews.length})`,
      children: (
        <Table
          size="small"
          dataSource={storeReviews}
          columns={[
            { title: '작성일', dataIndex: 'reviewDate', key: 'reviewDate' },
            { title: '평점', dataIndex: 'rating', key: 'rating', render: (r: number) => <Tag color="gold">{r}점</Tag> },
            { title: '내용', dataIndex: 'content', key: 'content', ellipsis: true },
            { title: '상태', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
          ]}
          pagination={{ pageSize: 5 }}
          rowKey="id"
          locale={{ emptyText: '리뷰가 없습니다.' }}
        />
      ),
    },
    {
      key: 'settlements',
      label: `정산 (${storeSettlements.length})`,
      children: (
        <Table
          size="small"
          dataSource={storeSettlements}
          columns={[
            { title: '정산 기간', key: 'period', render: (_, record) => `${record.periodStart} ~ ${record.periodEnd}` },
            { title: '주문수', dataIndex: 'orderCount', key: 'orderCount', render: (v: number) => `${v}건` },
            { title: '총 매출', dataIndex: 'totalSales', key: 'totalSales', render: (v: number) => `${v.toLocaleString()}원` },
            { title: '수수료', dataIndex: 'fee', key: 'fee', render: (v: number) => `${v.toLocaleString()}원` },
            { title: '정산액', dataIndex: 'settlementAmount', key: 'settlementAmount', render: (v: number) => `${v.toLocaleString()}원` },
            { title: '상태', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
          ]}
          pagination={{ pageSize: 5 }}
          rowKey="id"
          locale={{ emptyText: '정산 내역이 없습니다.' }}
        />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          목록으로
        </Button>
      </Space>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>{store.name}</Title>
            <Text type="secondary">{store.category} · {store.region}</Text>
          </div>
          <Space>
            <StatusBadge status={store.status} />
            <Button icon={<EditOutlined />}>수정</Button>
          </Space>
        </div>

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}
