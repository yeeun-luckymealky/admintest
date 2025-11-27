'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Table, Input, Select, Button, Typography, Space, Row, Col, Tag, Progress } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockCustomers } from '@/data/mockData';
import type { Customer, CustomerStatus } from '@/types';

const { Title } = Typography;
const { Search } = Input;

export default function CustomersPage() {
  const router = useRouter();

  // 자연어 검색
  const [nlSearch, setNlSearch] = useState('');
  const [activeNlSearch, setActiveNlSearch] = useState('');

  // 필터 입력 상태
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  // 실제 검색 조건 상태
  const [searchPhone, setSearchPhone] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('전체');

  // 자연어 검색 처리 (닉네임, 전화번호, 이메일, 고객ID 모두 검색)
  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter((customer) => {
      // 자연어 검색
      if (activeNlSearch) {
        const searchLower = activeNlSearch.toLowerCase();
        const matchesNl =
          customer.nickname.toLowerCase().includes(searchLower) ||
          customer.phone.includes(activeNlSearch) ||
          (customer.email?.toLowerCase().includes(searchLower)) ||
          customer.id.includes(activeNlSearch);
        if (!matchesNl) return false;
      }
      // 상세 필터
      if (searchPhone && !customer.phone.includes(searchPhone)) return false;
      if (searchStatus !== '전체' && customer.status !== searchStatus) return false;
      return true;
    });
  }, [activeNlSearch, searchPhone, searchStatus]);

  const handleNlSearch = (value: string) => {
    setActiveNlSearch(value);
  };

  const handleSearch = () => {
    setSearchPhone(phoneFilter);
    setSearchStatus(statusFilter);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRowClick = (record: Customer) => {
    router.push(`/customers/${record.id}`);
  };

  // 매너지수 색상
  const getMannerColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#1890ff';
    if (score >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: '고객 ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '닉네임',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (nickname: string, record: Customer) => (
        <a onClick={() => handleRowClick(record)}>{nickname}</a>
      ),
    },
    {
      title: '휴대전화',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '가입일',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
    },
    {
      title: '매너지수',
      dataIndex: 'mannerScore',
      key: 'mannerScore',
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          strokeColor={getMannerColor(score)}
          format={(p) => `${p}점`}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '주문수',
      dataIndex: 'orderCount',
      key: 'orderCount',
      render: (count: number) => `${count}건`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: CustomerStatus) => <StatusBadge status={status} />,
    },
    {
      title: '관리',
      key: 'action',
      render: (_: unknown, record: Customer) => (
        <Button size="small" onClick={() => handleRowClick(record)}>상세</Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>유저 관리</Title>

      {/* 자연어 검색 */}
      <Card style={{ marginBottom: 16 }}>
        <Search
          placeholder="닉네임, 전화번호, 이메일, 고객ID로 검색하세요"
          allowClear
          enterButton="검색"
          size="large"
          value={nlSearch}
          onChange={(e) => setNlSearch(e.target.value)}
          onSearch={handleNlSearch}
        />
      </Card>

      {/* 상세 필터 영역 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Input
                placeholder="휴대전화 번호"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ width: 200 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={[
                  { label: '전체 상태', value: '전체' },
                  { label: '활성', value: '활성' },
                  { label: '탈퇴', value: '탈퇴' },
                ]}
              />
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              필터 적용
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 테이블 */}
      <Card>
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            total: filteredCustomers.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}명`,
          }}
        />
      </Card>
    </div>
  );
}
