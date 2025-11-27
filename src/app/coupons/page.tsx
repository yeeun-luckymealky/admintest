'use client';

import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Typography, Space, Row, Col, Modal, Form, Input, DatePicker, InputNumber, Select, message, Tag, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockCoupons, mockCustomers } from '@/data/mockData';
import type { Coupon } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();
  const [extendForm] = Form.useForm();

  // 검색 및 필터
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  // 고객 검색 결과
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone: string } | null>(null);

  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      // 검색어 필터
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchesSearch =
          coupon.customerName.toLowerCase().includes(search) ||
          coupon.customerPhone.includes(search) ||
          coupon.code.toLowerCase().includes(search) ||
          coupon.name.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      // 상태 필터
      if (statusFilter !== '전체' && coupon.status !== statusFilter) return false;
      return true;
    });
  }, [coupons, searchText, statusFilter]);

  // 고객 검색 결과
  const searchedCustomers = useMemo(() => {
    if (!customerSearchText) return [];
    const search = customerSearchText.toLowerCase();
    return mockCustomers.filter(c =>
      c.nickname.toLowerCase().includes(search) ||
      c.phone.includes(customerSearchText)
    ).slice(0, 5);
  }, [customerSearchText]);

  const handleIssue = () => {
    setSelectedCustomer(null);
    setCustomerSearchText('');
    form.resetFields();
    form.setFieldsValue({
      expiresAt: dayjs().add(30, 'day'),
    });
    setIssueModalOpen(true);
  };

  const handleSelectCustomer = (customer: { nickname: string; phone: string }) => {
    setSelectedCustomer({ name: customer.nickname, phone: customer.phone });
    form.setFieldsValue({
      customerName: customer.nickname,
      customerPhone: customer.phone,
    });
    setCustomerSearchText('');
  };

  const handleIssueCoupon = async () => {
    try {
      const values = await form.validateFields();
      const newCoupon: Coupon = {
        id: String(Date.now()),
        code: `COUPON${Date.now().toString().slice(-6)}`,
        name: values.name,
        discount: values.discount,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        issuedAt: dayjs().format('YYYY-MM-DD'),
        expiresAt: values.expiresAt.format('YYYY-MM-DD'),
        status: '사용가능',
      };
      setCoupons(prev => [newCoupon, ...prev]);
      message.success(`${values.customerName}님에게 쿠폰이 발급되었습니다.`);
      setIssueModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleExtend = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    extendForm.setFieldsValue({
      currentExpiry: coupon.expiresAt,
      newExpiry: dayjs(coupon.expiresAt).add(30, 'day'),
    });
    setExtendModalOpen(true);
  };

  const handleExtendSubmit = async () => {
    try {
      const values = await extendForm.validateFields();
      if (selectedCoupon) {
        setCoupons(prev => prev.map(c =>
          c.id === selectedCoupon.id
            ? { ...c, expiresAt: values.newExpiry.format('YYYY-MM-DD') }
            : c
        ));
        message.success('유효기간이 연장되었습니다.');
        setExtendModalOpen(false);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '쿠폰 삭제',
      content: '이 쿠폰을 삭제하시겠습니까? 삭제된 쿠폰은 사용할 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: '삭제' as const } : c));
        message.success('쿠폰이 삭제되었습니다.');
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '사용가능': return 'green';
      case '사용완료': return 'blue';
      case '만료': return 'orange';
      case '삭제': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '쿠폰코드',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: '쿠폰명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '할인금액',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: number) => <Text strong style={{ color: '#1890ff' }}>{discount.toLocaleString()}원</Text>,
    },
    {
      title: '수령자',
      key: 'customer',
      render: (_: unknown, record: Coupon) => (
        <div>
          <div>{record.customerName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.customerPhone}</Text>
        </div>
      ),
    },
    {
      title: '발급일',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
    },
    {
      title: '유효기간',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
    },
    {
      title: '사용일',
      dataIndex: 'usedAt',
      key: 'usedAt',
      render: (usedAt: string) => usedAt || '-',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '관리',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Coupon) => (
        <Space>
          {record.status === '사용가능' && (
            <>
              <Button size="small" icon={<CalendarOutlined />} onClick={() => handleExtend(record)}>
                연장
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
            </>
          )}
        </Space>
      ),
    },
  ];

  // 통계
  const stats = useMemo(() => {
    const available = coupons.filter(c => c.status === '사용가능').length;
    const used = coupons.filter(c => c.status === '사용완료').length;
    const expired = coupons.filter(c => c.status === '만료').length;
    const totalDiscount = coupons.filter(c => c.status === '사용완료').reduce((sum, c) => sum + c.discount, 0);
    return { available, used, expired, totalDiscount };
  }, [coupons]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>쿠폰 관리</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleIssue}>
          쿠폰 발급
        </Button>
      </div>

      {/* 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">사용가능</Text>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{stats.available}건</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">사용완료</Text>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{stats.used}건</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">만료</Text>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>{stats.expired}건</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Text type="secondary">사용된 총 할인액</Text>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>{stats.totalDiscount.toLocaleString()}원</div>
          </Card>
        </Col>
      </Row>

      {/* 검색 및 필터 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="고객명, 전화번호, 쿠폰코드로 검색"
              allowClear
              onSearch={setSearchText}
              onChange={(e) => !e.target.value && setSearchText('')}
              style={{ width: 400 }}
            />
          </Col>
          <Col>
            <Space>
              <Text>상태:</Text>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                options={[
                  { label: '전체', value: '전체' },
                  { label: '사용가능', value: '사용가능' },
                  { label: '사용완료', value: '사용완료' },
                  { label: '만료', value: '만료' },
                  { label: '삭제', value: '삭제' },
                ]}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 테이블 */}
      <Card>
        <Table
          dataSource={filteredCoupons}
          columns={columns}
          rowKey="id"
          pagination={{
            total: filteredCoupons.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
        />
      </Card>

      {/* 쿠폰 발급 모달 */}
      <Modal
        title="쿠폰 발급"
        open={issueModalOpen}
        onCancel={() => setIssueModalOpen(false)}
        onOk={handleIssueCoupon}
        okText="발급"
        cancelText="취소"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="고객 검색">
            <Search
              placeholder="고객명 또는 전화번호로 검색"
              value={customerSearchText}
              onChange={(e) => setCustomerSearchText(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            {searchedCustomers.length > 0 && (
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, maxHeight: 150, overflow: 'auto' }}>
                {searchedCustomers.map(customer => (
                  <div
                    key={customer.id}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <Text strong>{customer.nickname}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>{customer.phone}</Text>
                  </div>
                ))}
              </div>
            )}
            {selectedCustomer && (
              <Tag color="blue" style={{ marginTop: 8 }}>
                선택됨: {selectedCustomer.name} ({selectedCustomer.phone})
              </Tag>
            )}
          </Form.Item>

          <Form.Item name="customerName" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="customerPhone"
            label="전화번호"
            rules={[{ required: true, message: '전화번호를 입력해주세요' }]}
          >
            <Input placeholder="010-0000-0000" />
          </Form.Item>

          <Form.Item
            name="name"
            label="쿠폰명"
            rules={[{ required: true, message: '쿠폰명을 입력해주세요' }]}
          >
            <Input placeholder="예: 신규 가입 할인 쿠폰" />
          </Form.Item>

          <Form.Item
            name="discount"
            label="할인금액"
            rules={[{ required: true, message: '할인금액을 입력해주세요' }]}
          >
            <InputNumber
              min={1000}
              step={1000}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) as unknown as 1000}
              addonAfter="원"
            />
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label="유효기간"
            rules={[{ required: true, message: '유효기간을 선택해주세요' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 유효기간 연장 모달 */}
      <Modal
        title="유효기간 연장"
        open={extendModalOpen}
        onCancel={() => setExtendModalOpen(false)}
        onOk={handleExtendSubmit}
        okText="연장"
        cancelText="취소"
        width={400}
      >
        <Form form={extendForm} layout="vertical">
          <Form.Item name="currentExpiry" label="현재 유효기간">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="newExpiry"
            label="새 유효기간"
            rules={[{ required: true, message: '새 유효기간을 선택해주세요' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
