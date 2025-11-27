'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Table, Input, Select, Button, Typography, Space, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockStores } from '@/data/mockData';
import type { Store, StoreStatus } from '@/types';

const { Title } = Typography;
const { Search } = Input;

// 운영중인 가게만 필터링
const operatingStores = mockStores.filter((s) => s.status === '심사완료');

export default function StoresPage() {
  const router = useRouter();

  // 자연어 검색
  const [nlSearch, setNlSearch] = useState('');
  const [activeNlSearch, setActiveNlSearch] = useState('');

  // 상세 필터
  const [nameFilter, setNameFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('전체');
  const [searchName, setSearchName] = useState('');
  const [searchRegion, setSearchRegion] = useState<string>('전체');

  // 자연어 검색 처리 (상호명, 지역, 카테고리, 사장님 이름/연락처 모두 검색)
  const filteredStores = useMemo(() => {
    return operatingStores.filter((store) => {
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
      // 상세 필터
      if (searchName && !store.name.includes(searchName)) return false;
      if (searchRegion !== '전체' && store.region !== searchRegion) return false;
      return true;
    });
  }, [activeNlSearch, searchName, searchRegion]);

  const handleNlSearch = (value: string) => {
    setActiveNlSearch(value);
  };

  const handleSearch = () => {
    setSearchName(nameFilter);
    setSearchRegion(regionFilter);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
      title: '사장님 연락처',
      dataIndex: 'ownerPhone',
      key: 'ownerPhone',
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
      <Title level={4} style={{ marginBottom: 24 }}>가게 관리</Title>

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
              <Input
                placeholder="상호명"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ width: 200 }}
              />
              <Select
                value={regionFilter}
                onChange={setRegionFilter}
                style={{ width: 150 }}
                options={[
                  { label: '전체 지역', value: '전체' },
                  { label: '서울', value: '서울' },
                  { label: '대전', value: '대전' },
                  { label: '부산', value: '부산' },
                  { label: '인천', value: '인천' },
                  { label: '대구', value: '대구' },
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
