'use client';

import React, { useState, useMemo } from 'react';
import { Card, Table, Select, Button, Typography, Space, Row, Col, DatePicker, Checkbox, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import StatusCards, { getSettlementStatusCards } from '@/components/common/StatusCards';
import StatusBadge from '@/components/common/StatusBadge';
import { mockSettlements, settlementStatusCounts } from '@/data/mockData';
import type { SettlementStatus } from '@/types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function SettlementsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const filteredSettlements = useMemo(() => {
    return mockSettlements.filter((s) => {
      if (selectedStatus && s.status !== selectedStatus) return false;
      return true;
    });
  }, [selectedStatus]);

  const statusCards = getSettlementStatusCards(settlementStatusCounts);

  const handleBatchProcess = () => {
    if (selectedRows.length === 0) {
      message.warning('정산 항목을 선택해주세요.');
      return;
    }
    const totalAmount = mockSettlements
      .filter((s) => selectedRows.includes(s.id))
      .reduce((sum, s) => sum + s.settlementAmount, 0);
    message.success(`${selectedRows.length}건 (${totalAmount.toLocaleString()}원) 일괄 정산 처리`);
  };

  const columns = [
    {
      title: '정산ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '가게명',
      dataIndex: 'storeName',
      key: 'storeName',
    },
    {
      title: '정산 기간',
      key: 'period',
      render: (_: unknown, record: typeof mockSettlements[0]) => `${record.periodStart} ~ ${record.periodEnd}`,
    },
    {
      title: '주문 건수',
      dataIndex: 'orderCount',
      key: 'orderCount',
      render: (count: number) => `${count}건`,
    },
    {
      title: '총 매출액',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (amount: number) => `${amount.toLocaleString()}원`,
    },
    {
      title: '수수료',
      dataIndex: 'fee',
      key: 'fee',
      render: (amount: number) => `${amount.toLocaleString()}원`,
    },
    {
      title: '정산 금액',
      dataIndex: 'settlementAmount',
      key: 'settlementAmount',
      render: (amount: number) => <strong>{amount.toLocaleString()}원</strong>,
    },
    {
      title: '정산 예정일',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: SettlementStatus) => <StatusBadge status={status} />,
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRows(selectedRowKeys as string[]);
    },
    getCheckboxProps: (record: typeof mockSettlements[0]) => ({
      disabled: record.status !== '정산대기',
    }),
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>정산 관리</Title>

      {/* 필터 영역 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle" wrap>
              <Select
                placeholder="가게명"
                style={{ width: 200 }}
                allowClear
                options={[...new Set(mockSettlements.map((s) => s.storeName))].map((name) => ({
                  label: name,
                  value: name,
                }))}
              />
              <RangePicker placeholder={['정산 시작일', '정산 종료일']} />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} className="search-btn">
                검색
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleBatchProcess}>
                일괄 정산 처리
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 선택 정보 */}
      {selectedRows.length > 0 && (
        <Card style={{ marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Space size="large">
            <span>선택: <strong>{selectedRows.length}건</strong></span>
            <span>
              총 정산금액:{' '}
              <strong>
                {mockSettlements
                  .filter((s) => selectedRows.includes(s.id))
                  .reduce((sum, s) => sum + s.settlementAmount, 0)
                  .toLocaleString()}
                원
              </strong>
            </span>
          </Space>
        </Card>
      )}

      {/* 상태 카드 */}
      <StatusCards
        items={statusCards}
        selectedStatus={selectedStatus}
        onStatusClick={setSelectedStatus}
      />

      {/* 테이블 */}
      <Card>
        <Table
          rowSelection={rowSelection}
          dataSource={filteredSettlements}
          columns={columns}
          rowKey="id"
          pagination={{
            total: filteredSettlements.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
        />
      </Card>
    </div>
  );
}
