'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Table, List, Typography, Tag } from 'antd';
import {
  ShoppingCartOutlined,
  ShopOutlined,
  WarningOutlined,
  MessageOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { mockDashboardStats, mockStores, mockReports, storeStatusCounts } from '@/data/mockData';

const { Title, Text } = Typography;

export default function DashboardPage() {
  // 심사중 가게 목록
  const pendingStores = mockStores.filter(s => s.status === '심사중').slice(0, 5);

  // 최근 신고 목록
  const recentReports = mockReports.slice(0, 5);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>대시보드</Title>

      {/* 상단 통계 카드 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="오늘 주문"
              value={mockDashboardStats.todayOrders}
              suffix="건"
              prefix={<ShoppingCartOutlined style={{ color: '#22c55e' }} />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="success">
                <ArrowUpOutlined /> {mockDashboardStats.todayOrdersChange}%
              </Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>전일 대비</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="심사대기 가게"
              value={mockDashboardStats.pendingStores}
              suffix="건"
              prefix={<ShopOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="orange">긴급!</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="미처리 신고"
              value={mockDashboardStats.pendingReports}
              suffix="건"
              prefix={<WarningOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="오늘 리뷰"
              value={mockDashboardStats.todayReviews}
              suffix="건"
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 가게 상태 분포 & 긴급 처리 필요 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="가게 상태 분포">
            <Row gutter={[8, 8]}>
              {Object.entries(storeStatusCounts).map(([status, count]) => (
                status !== 'total' && (
                  <Col span={8} key={status}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Text type="secondary">{status}</Text>
                      <div style={{ fontSize: 20, fontWeight: 600 }}>{count}</div>
                    </Card>
                  </Col>
                )
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="긴급 처리 필요">
            <List
              size="small"
              dataSource={[
                { label: '심사대기 가게', count: 3, color: 'orange' },
                { label: '미처리 신고', count: 5, color: 'red' },
                { label: '임박 쿠폰 만료', count: 12, color: 'gold' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item.label}</Text>
                  <Tag color={item.color}>{item.count}건</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 심사대기 가게 & 최근 신고 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="심사대기 가게" extra={<a href="/stores/settings">더보기</a>}>
            <Table
              dataSource={pendingStores}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: '상호명', dataIndex: 'name', key: 'name' },
                { title: '지역', dataIndex: 'region', key: 'region' },
                { title: '등록일', dataIndex: 'registeredAt', key: 'registeredAt' },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="최근 신고 내역" extra={<a href="/reports">더보기</a>}>
            <Table
              dataSource={recentReports}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: '신고일', dataIndex: 'reportedAt', key: 'reportedAt' },
                { title: '유형', dataIndex: 'type', key: 'type' },
                { title: '사유', dataIndex: 'reason', key: 'reason' },
                {
                  title: '상태',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const colors: Record<string, string> = {
                      '접수': 'default',
                      '처리중': 'blue',
                      '블랙': 'red',
                      '해제': 'green',
                    };
                    return <Tag color={colors[status]}>{status}</Tag>;
                  },
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
