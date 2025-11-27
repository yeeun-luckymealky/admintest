'use client';

import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Typography, Space, Row, Col, Modal, Form, Input, DatePicker, InputNumber, Select, message, Image, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, PictureOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockBanners } from '@/data/mockData';
import type { Banner } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form] = Form.useForm();

  // 상태별 필터
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  const filteredBanners = useMemo(() => {
    let result = [...banners];
    if (statusFilter !== '전체') {
      result = result.filter(b => b.status === statusFilter);
    }
    return result.sort((a, b) => a.order - b.order);
  }, [banners, statusFilter]);

  const handleAdd = () => {
    setEditingBanner(null);
    form.resetFields();
    form.setFieldsValue({ order: banners.length + 1 });
    setModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    form.setFieldsValue({
      ...banner,
      period: [dayjs(banner.startDate), dayjs(banner.endDate)],
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '배너 삭제',
      content: '이 배너를 삭제하시겠습니까?',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => {
        setBanners(prev => prev.filter(b => b.id !== id));
        message.success('배너가 삭제되었습니다.');
      },
    });
  };

  const handleMoveUp = (id: string) => {
    setBanners(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index <= 0) return prev;
      const newBanners = [...prev];
      const currentOrder = newBanners[index].order;
      newBanners[index].order = newBanners[index - 1].order;
      newBanners[index - 1].order = currentOrder;
      return newBanners.sort((a, b) => a.order - b.order);
    });
    message.success('순서가 변경되었습니다.');
  };

  const handleMoveDown = (id: string) => {
    setBanners(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index >= prev.length - 1) return prev;
      const newBanners = [...prev];
      const currentOrder = newBanners[index].order;
      newBanners[index].order = newBanners[index + 1].order;
      newBanners[index + 1].order = currentOrder;
      return newBanners.sort((a, b) => a.order - b.order);
    });
    message.success('순서가 변경되었습니다.');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const bannerData = {
        ...values,
        startDate: values.period[0].format('YYYY-MM-DD'),
        endDate: values.period[1].format('YYYY-MM-DD'),
      };
      delete bannerData.period;

      if (editingBanner) {
        setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...bannerData } : b));
        message.success('배너가 수정되었습니다.');
      } else {
        const newBanner: Banner = {
          id: String(Date.now()),
          ...bannerData,
          createdAt: dayjs().format('YYYY-MM-DD'),
        };
        setBanners(prev => [...prev, newBanner]);
        message.success('배너가 등록되었습니다.');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: '순서',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      render: (order: number) => <Tag>{order}</Tag>,
    },
    {
      title: '미리보기',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (url: string) => (
        <div style={{ width: 100, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
          <PictureOutlined style={{ fontSize: 24, color: '#999' }} />
        </div>
      ),
    },
    {
      title: '배너명',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '노출 기간',
      key: 'period',
      render: (_: unknown, record: Banner) => (
        <Text>{record.startDate} ~ {record.endDate}</Text>
      ),
    },
    {
      title: '링크',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      render: (url: string) => url || '-',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '순서 변경',
      key: 'reorder',
      width: 100,
      render: (_: unknown, record: Banner) => (
        <Space>
          <Button size="small" icon={<ArrowUpOutlined />} onClick={() => handleMoveUp(record.id)} />
          <Button size="small" icon={<ArrowDownOutlined />} onClick={() => handleMoveDown(record.id)} />
        </Space>
      ),
    },
    {
      title: '관리',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Banner) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>수정</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>배너 관리</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          배너 등록
        </Button>
      </div>

      {/* 필터 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Text>상태:</Text>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { label: '전체', value: '전체' },
              { label: '노출중', value: '노출중' },
              { label: '대기', value: '대기' },
              { label: '종료', value: '종료' },
              { label: '비활성', value: '비활성' },
            ]}
          />
        </Space>
      </Card>

      {/* 테이블 */}
      <Card>
        <Table
          dataSource={filteredBanners}
          columns={columns}
          rowKey="id"
          pagination={{
            total: filteredBanners.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개`,
          }}
        />
      </Card>

      {/* 배너 등록/수정 모달 */}
      <Modal
        title={editingBanner ? '배너 수정' : '배너 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editingBanner ? '수정' : '등록'}
        cancelText="취소"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="배너명"
            rules={[{ required: true, message: '배너명을 입력해주세요' }]}
          >
            <Input placeholder="배너명 입력" />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="이미지 URL"
            rules={[{ required: true, message: '이미지 URL을 입력해주세요' }]}
          >
            <Input placeholder="이미지 URL 입력 (예: /banners/image.jpg)" />
          </Form.Item>

          <Form.Item
            name="linkUrl"
            label="링크 URL (선택)"
          >
            <Input placeholder="클릭 시 이동할 URL (선택사항)" />
          </Form.Item>

          <Form.Item
            name="period"
            label="노출 기간"
            rules={[{ required: true, message: '노출 기간을 선택해주세요' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="order"
                label="노출 순서"
                rules={[{ required: true, message: '순서를 입력해주세요' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="상태"
                rules={[{ required: true, message: '상태를 선택해주세요' }]}
              >
                <Select
                  options={[
                    { label: '노출중', value: '노출중' },
                    { label: '대기', value: '대기' },
                    { label: '종료', value: '종료' },
                    { label: '비활성', value: '비활성' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
