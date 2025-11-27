'use client';

import React, { useState } from 'react';
import { Card, Table, Input, Select, Button, Typography, Space, Row, Col, DatePicker, Rate, Modal, Descriptions, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockReviews } from '@/data/mockData';
import type { Review, ReviewStatus } from '@/types';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function ReviewsPage() {
  // 필터 입력 상태
  const [storeFilter, setStoreFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  // 실제 검색 조건 상태
  const [searchStore, setSearchStore] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('전체');

  // 모달 상태
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredReviews = mockReviews.filter((review) => {
    if (searchStore && !review.storeName.includes(searchStore)) return false;
    if (searchPhone && !review.customerPhone.includes(searchPhone)) return false;
    if (searchStatus !== '전체' && review.status !== searchStatus) return false;
    return true;
  });

  const handleSearch = () => {
    setSearchStore(storeFilter);
    setSearchPhone(phoneFilter);
    setSearchStatus(statusFilter);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRowClick = (record: Review) => {
    setSelectedReview(record);
    setModalOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    message.success(`리뷰 상태가 '${newStatus}'(으)로 변경되었습니다.`);
    setModalOpen(false);
  };

  const columns = [
    {
      title: '가게명',
      dataIndex: 'storeName',
      key: 'storeName',
      render: (text: string, record: Review) => (
        <div>
          <div><a onClick={() => handleRowClick(record)}>{text}</a></div>
          <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.id}</Text>
        </div>
      ),
    },
    {
      title: '고객정보',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      render: (phone: string) => phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3'),
    },
    {
      title: '평점',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />,
    },
    {
      title: '리뷰 내용',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      ellipsis: true,
    },
    {
      title: '구매일',
      dataIndex: 'orderDate',
      key: 'orderDate',
    },
    {
      title: '작성일',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReviewStatus) => <StatusBadge status={status} />,
    },
    {
      title: '관리',
      key: 'action',
      render: (_: unknown, record: Review) => (
        <Button size="small" onClick={() => handleRowClick(record)}>상세</Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>리뷰 관리</Title>

      {/* 필터 영역 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle" wrap>
              <Input
                placeholder="가게명"
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ width: 200 }}
              />
              <Input
                placeholder="고객 전화번호"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ width: 180 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={[
                  { label: '전체 상태', value: '전체' },
                  { label: '정상', value: '정상' },
                  { label: '숨김', value: '숨김' },
                  { label: '삭제', value: '삭제' },
                ]}
              />
              <RangePicker placeholder={['작성 시작일', '작성 종료일']} />
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
          dataSource={filteredReviews}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            total: filteredReviews.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
        />
      </Card>

      {/* 리뷰 상세 모달 */}
      <Modal
        title="리뷰 상세"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setModalOpen(false)}>닫기</Button>,
          selectedReview?.status === '정상' && (
            <Button key="hide" onClick={() => handleStatusChange('숨김')}>숨김 처리</Button>
          ),
          selectedReview?.status === '숨김' && (
            <Button key="show" type="primary" onClick={() => handleStatusChange('정상')}>숨김 해제</Button>
          ),
          selectedReview?.status !== '삭제' && (
            <Button key="delete" danger onClick={() => handleStatusChange('삭제')}>삭제</Button>
          ),
        ]}
      >
        {selectedReview && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="가게명">{selectedReview.storeName}</Descriptions.Item>
              <Descriptions.Item label="고객 전화번호">{selectedReview.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="구매일">{selectedReview.orderDate}</Descriptions.Item>
              <Descriptions.Item label="작성일">{selectedReview.reviewDate}</Descriptions.Item>
              <Descriptions.Item label="평점" span={2}>
                <Rate disabled defaultValue={selectedReview.rating} />
              </Descriptions.Item>
              <Descriptions.Item label="상태" span={2}>
                <StatusBadge status={selectedReview.status} />
              </Descriptions.Item>
            </Descriptions>
            <Card size="small" title="리뷰 내용">
              <Paragraph>{selectedReview.content}</Paragraph>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
}
