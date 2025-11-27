'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Table, Select, Button, Typography, Space, Row, Col, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import StatusCards, { getStoreStatusCards } from '@/components/common/StatusCards';
import StatusBadge from '@/components/common/StatusBadge';
import { mockStores, storeStatusCounts } from '@/data/mockData';
import type { Store, StoreStatus } from '@/types';

const { Title } = Typography;
const { Search } = Input;

const regions = ['전체', '서울', '대전', '부산', '인천', '대구', '광주'];
const periods = ['전체 기간', '최근 7일', '최근 30일', '최근 90일'];

export default function StoreSettingsPage() {
  const router = useRouter();

  // 자연어 검색
  const [nlSearch, setNlSearch] = useState('');
  const [activeNlSearch, setActiveNlSearch] = useState('');

  // 필터 입력 상태
  const [regionFilter, setRegionFilter] = useState<string>('전체');
  const [periodFilter, setPeriodFilter] = useState<string>('전체 기간');

  // 실제 검색 조건 상태
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchRegion, setSearchRegion] = useState<string>('전체');

  // 자연어 검색 및 필터링된 가게 목록
  const filteredStores = useMemo(() => {
    return mockStores.filter((store) => {
      // 자연어 검색
      if (activeNlSearch) {
        const searchLower = activeNlSearch.toLowerCase();
        const matchesNl =
          store.name.toLowerCase().includes(searchLower) ||
          store.region.toLowerCase().includes(searchLower) ||
          store.category.toLowerCase().includes(searchLower) ||
          (store.ownerName?.toLowerCase().includes(searchLower)) ||
          (store.ownerPhone?.includes(activeNlSearch)) ||
          (store.address?.toLowerCase().includes(searchLower));
        if (!matchesNl) return false;
      }
      // 상태 필터
      if (selectedStatus && store.status !== selectedStatus) return false;
      // 지역 필터
      if (searchRegion !== '전체' && store.region !== searchRegion) return false;
      return true;
    });
  }, [activeNlSearch, selectedStatus, searchRegion]);

  const statusCards = getStoreStatusCards(storeStatusCounts);

  const handleNlSearch = (value: string) => {
    setActiveNlSearch(value);
  };

  const handleSearch = () => {
    setSearchRegion(regionFilter);
  };

  const handleRowClick = (record: Store) => {
    router.push(`/stores/${record.id}`);
  };

  const columns = [
    {
      title: '상호명',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Store) => (
        <a onClick={() => handleRowClick(record)}>{text}</a>
      ),
    },
    {
      title: '지역',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: '카테고리',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '등록일',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: StoreStatus) => <StatusBadge status={status} />,
    },
    {
      title: '관리',
      key: 'action',
      render: (_: unknown, record: Store) => (
        <Space>
          <Button size="small" onClick={() => handleRowClick(record)}>상세</Button>
          <Button size="small">수정</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>가게 설정</Title>

      {/* 자연어 검색 */}
      <Card style={{ marginBottom: 16 }}>
        <Search
          placeholder="가게명, 지역, 카테고리, 사장님 이름/연락처로 검색하세요"
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
              <Select
                value={regionFilter}
                onChange={setRegionFilter}
                style={{ width: 200 }}
                options={regions.map((r) => ({ label: r === '전체' ? '지역선택' : r, value: r }))}
                placeholder="지역선택"
              />
              <Select
                value={periodFilter}
                onChange={setPeriodFilter}
                style={{ width: 200 }}
                options={periods.map((p) => ({ label: p === '전체 기간' ? '기간선택' : p, value: p }))}
                placeholder="기간선택"
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

      {/* 상태 카드 */}
      <StatusCards
        items={statusCards}
        selectedStatus={selectedStatus}
        onStatusClick={setSelectedStatus}
      />

      {/* 테이블 */}
      <Card>
        <Table
          dataSource={filteredStores}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            total: filteredStores.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개`,
          }}
        />
      </Card>

    </div>
  );
}
