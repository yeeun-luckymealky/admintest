'use client';

import React, { useState } from 'react';
import { Card, Table, Select, Button, Typography, Space, Row, Col, DatePicker, Tag, Modal, message, Descriptions } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockReports } from '@/data/mockData';
import type { Report, ReportStatus } from '@/types';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function ReportsPage() {
  // 필터 입력 상태
  const [typeFilter, setTypeFilter] = useState<string>('전체');
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  // 실제 검색 조건 상태
  const [searchType, setSearchType] = useState<string>('전체');
  const [searchStatus, setSearchStatus] = useState<string>('전체');

  // 모달 상태
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredReports = mockReports.filter((report) => {
    if (searchType !== '전체' && report.type !== searchType) return false;
    if (searchStatus !== '전체' && report.status !== searchStatus) return false;
    return true;
  });

  const handleSearch = () => {
    setSearchType(typeFilter);
    setSearchStatus(statusFilter);
  };

  const handleRowClick = (record: Report) => {
    setSelectedReport(record);
    setModalOpen(true);
  };

  const handleRelease = (id: string) => {
    Modal.confirm({
      title: '블랙리스트 해제',
      content: '해당 블랙리스트를 해제하시겠습니까?',
      okText: '해제',
      cancelText: '취소',
      onOk: () => {
        message.success('블랙리스트가 해제되었습니다.');
        setModalOpen(false);
      },
    });
  };

  const handleStatusChange = (newStatus: string) => {
    message.success(`신고 상태가 '${newStatus}'(으)로 변경되었습니다.`);
    setModalOpen(false);
  };

  const columns = [
    {
      title: '신고일',
      dataIndex: 'reportedAt',
      key: 'reportedAt',
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === '가게→고객' ? 'blue' : 'purple'}>{type}</Tag>
      ),
    },
    {
      title: '신고자',
      dataIndex: 'reporter',
      key: 'reporter',
      render: (text: string, record: Report) => (
        <a onClick={() => handleRowClick(record)}>{text}</a>
      ),
    },
    {
      title: '피신고자',
      dataIndex: 'reported',
      key: 'reported',
    },
    {
      title: '사유',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReportStatus) => <StatusBadge status={status} />,
    },
    {
      title: '관리',
      key: 'action',
      render: (_: unknown, record: Report) => (
        <Space>
          <Button size="small" onClick={() => handleRowClick(record)}>상세</Button>
          {record.status === '블랙' && (
            <Button size="small" danger onClick={() => handleRelease(record.id)}>
              해제
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>신고/블랙리스트 관리</Title>

      {/* 필터 영역 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle" wrap>
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 150 }}
                options={[
                  { label: '전체 유형', value: '전체' },
                  { label: '가게→고객', value: '가게→고객' },
                  { label: '고객→가게', value: '고객→가게' },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={[
                  { label: '전체 상태', value: '전체' },
                  { label: '접수', value: '접수' },
                  { label: '처리중', value: '처리중' },
                  { label: '블랙', value: '블랙' },
                  { label: '해제', value: '해제' },
                ]}
              />
              <RangePicker placeholder={['신고 시작일', '신고 종료일']} />
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
          dataSource={filteredReports}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            total: filteredReports.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
        />
      </Card>

      {/* 신고 상세 모달 */}
      <Modal
        title="신고 상세"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>닫기</Button>,
          selectedReport?.status === '접수' && (
            <Button key="process" type="primary" onClick={() => handleStatusChange('처리중')}>처리 시작</Button>
          ),
          selectedReport?.status === '처리중' && (
            <Button key="black" danger onClick={() => handleStatusChange('블랙')}>블랙리스트 등록</Button>
          ),
          selectedReport?.status === '블랙' && (
            <Button key="release" onClick={() => handleRelease(selectedReport.id)}>블랙리스트 해제</Button>
          ),
        ]}
      >
        {selectedReport && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="신고일">{selectedReport.reportedAt}</Descriptions.Item>
            <Descriptions.Item label="유형">
              <Tag color={selectedReport.type === '가게→고객' ? 'blue' : 'purple'}>{selectedReport.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="신고자">{selectedReport.reporter}</Descriptions.Item>
            <Descriptions.Item label="피신고자">{selectedReport.reported}</Descriptions.Item>
            <Descriptions.Item label="사유" span={2}>{selectedReport.reason}</Descriptions.Item>
            <Descriptions.Item label="현재 상태" span={2}>
              <StatusBadge status={selectedReport.status} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
