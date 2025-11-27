'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, Descriptions, Tabs, Statistic, Table, Button, Space, Row, Col, Tag, Progress } from 'antd';
import { ArrowLeftOutlined, UserOutlined, PhoneOutlined, MailOutlined, EditOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockCustomers, mockOrders, mockReports } from '@/data/mockData';

const { Title, Text } = Typography;

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const customer = mockCustomers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Title level={4}>고객을 찾을 수 없습니다.</Title>
        <Button type="primary" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>
    );
  }

  // 해당 고객의 주문 내역
  const customerOrders = mockOrders.filter((order) => order.customerPhone === customer.phone);

  // 해당 고객의 신고 이력
  const customerReports = mockReports.filter(
    (report) => report.reported.includes(customer.phone) || report.reporter.includes(customer.phone)
  );

  // 통계 계산
  const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const completedOrders = customerOrders.filter((o) => o.status === '픽업확정').length;
  const cancelledOrders = customerOrders.filter((o) => o.status === '유저취소').length;

  // 매너지수 색상
  const getMannerColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#1890ff';
    if (score >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const tabItems = [
    {
      key: 'info',
      label: '기본 정보',
      children: (
        <div>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="고객 ID">{customer.id}</Descriptions.Item>
            <Descriptions.Item label="닉네임">{customer.nickname}</Descriptions.Item>
            <Descriptions.Item label="휴대전화">
              <PhoneOutlined /> {customer.phone}
            </Descriptions.Item>
            <Descriptions.Item label="이메일">
              <MailOutlined /> {customer.email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="가입일">{customer.registeredAt}</Descriptions.Item>
            <Descriptions.Item label="총 주문수">{customer.orderCount}건</Descriptions.Item>
            <Descriptions.Item label="현재 상태" span={2}>
              <StatusBadge status={customer.status} />
            </Descriptions.Item>
          </Descriptions>

          <Card size="small" style={{ marginTop: 16 }}>
            <Title level={5}>매너지수</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Progress
                type="circle"
                percent={customer.mannerScore}
                strokeColor={getMannerColor(customer.mannerScore)}
                format={(percent) => `${percent}점`}
                size={80}
              />
              <div>
                <Text>기본점수: 80점 / 최대점수: 100점</Text>
                <br />
                <Text type="secondary">
                  {customer.mannerScore >= 90 ? '우수 고객입니다.' :
                   customer.mannerScore >= 70 ? '양호한 매너를 보이고 있습니다.' :
                   customer.mannerScore >= 50 ? '주의가 필요한 고객입니다.' :
                   '매너 점수가 낮습니다.'}
                </Text>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'stats',
      label: '통계',
      children: (
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="총 주문수" value={customerOrders.length} suffix="건" />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="완료 주문" value={completedOrders} suffix="건" />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="취소 주문" value={cancelledOrders} suffix="건" />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="총 결제액" value={totalSpent} suffix="원" />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'orders',
      label: `주문 내역 (${customerOrders.length})`,
      children: (
        <Table
          size="small"
          dataSource={customerOrders}
          columns={[
            { title: '주문번호', dataIndex: 'orderNumber', key: 'orderNumber' },
            { title: '가게명', dataIndex: 'storeName', key: 'storeName' },
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
      key: 'coupons',
      label: '보유 쿠폰',
      children: (
        <Table
          size="small"
          dataSource={[
            { id: '1', name: '신규 가입 할인', discount: '2,000원', expiry: '2024-12-31', status: '사용가능' },
            { id: '2', name: '첫 주문 감사 쿠폰', discount: '1,000원', expiry: '2024-12-15', status: '사용가능' },
          ]}
          columns={[
            { title: '쿠폰명', dataIndex: 'name', key: 'name' },
            { title: '할인금액', dataIndex: 'discount', key: 'discount' },
            { title: '만료일', dataIndex: 'expiry', key: 'expiry' },
            { title: '상태', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color="green">{s}</Tag> },
          ]}
          pagination={false}
          rowKey="id"
          locale={{ emptyText: '보유 쿠폰이 없습니다.' }}
        />
      ),
    },
    {
      key: 'reports',
      label: `신고 이력 (${customerReports.length})`,
      children: (
        <Table
          size="small"
          dataSource={customerReports}
          columns={[
            { title: '신고일', dataIndex: 'reportedAt', key: 'reportedAt' },
            { title: '유형', dataIndex: 'type', key: 'type', render: (t: string) => (
              <Tag color={t === '가게→고객' ? 'blue' : 'purple'}>{t}</Tag>
            )},
            { title: '신고자', dataIndex: 'reporter', key: 'reporter' },
            { title: '사유', dataIndex: 'reason', key: 'reason' },
            { title: '상태', dataIndex: 'status', key: 'status', render: (s: string) => <StatusBadge status={s} /> },
          ]}
          pagination={{ pageSize: 5 }}
          rowKey="id"
          locale={{ emptyText: '신고 이력이 없습니다.' }}
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
            <Title level={4} style={{ margin: 0 }}>
              <UserOutlined style={{ marginRight: 8 }} />
              {customer.nickname}
            </Title>
            <Text type="secondary">{customer.phone}</Text>
          </div>
          <Space>
            <Tag color={getMannerColor(customer.mannerScore)}>매너지수 {customer.mannerScore}점</Tag>
            <StatusBadge status={customer.status} />
            <Button icon={<EditOutlined />}>수정</Button>
          </Space>
        </div>

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}
