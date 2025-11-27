'use client';

import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Typography, Space, Row, Col, Modal, Form, Input, DatePicker, Select, message, Tag, Tabs, Statistic, Badge } from 'antd';
import { PlusOutlined, SendOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import StatusBadge from '@/components/common/StatusBadge';
import { mockPushNotifications, mockCohorts, mockCustomers, mockStores } from '@/data/mockData';
import type { PushNotification, Cohort } from '@/types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Search } = Input;

export default function PushPage() {
  const [notifications, setNotifications] = useState<PushNotification[]>(mockPushNotifications);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);
  const [form] = Form.useForm();

  // 필터
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [targetFilter, setTargetFilter] = useState<string>('전체');

  // 대상 선택
  const [targetType, setTargetType] = useState<string>('전체고객');
  const [searchText, setSearchText] = useState('');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (statusFilter !== '전체' && n.status !== statusFilter) return false;
      if (targetFilter !== '전체' && n.targetType !== targetFilter) return false;
      return true;
    });
  }, [notifications, statusFilter, targetFilter]);

  // 검색된 고객/판매자
  const searchedCustomers = useMemo(() => {
    if (targetType !== '특정고객' || !searchText) return [];
    return mockCustomers.filter(c =>
      c.nickname.toLowerCase().includes(searchText.toLowerCase()) ||
      c.phone.includes(searchText)
    ).slice(0, 5);
  }, [targetType, searchText]);

  const searchedStores = useMemo(() => {
    if (targetType !== '특정판매자' || !searchText) return [];
    return mockStores.filter(s =>
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.ownerPhone?.includes(searchText)
    ).slice(0, 5);
  }, [targetType, searchText]);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      targetType: '전체고객',
      scheduledAt: dayjs().add(1, 'hour'),
    });
    setTargetType('전체고객');
    setSearchText('');
    setModalOpen(true);
  };

  const handleTargetTypeChange = (value: string) => {
    setTargetType(value);
    form.setFieldsValue({ targetDetail: undefined });
    setSearchText('');
  };

  const handleSelectTarget = (detail: string) => {
    form.setFieldsValue({ targetDetail: detail });
    setSearchText('');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 대상 인원 수 계산
      let targetCount = 0;
      switch (values.targetType) {
        case '전체고객':
          targetCount = mockCustomers.length * 100; // 임의로 설정
          break;
        case '전체판매자':
          targetCount = mockStores.filter(s => s.status === '심사완료').length;
          break;
        case '코호트':
          const cohort = mockCohorts.find(c => c.name === values.targetDetail);
          targetCount = cohort?.memberCount || 0;
          break;
        case '특정고객':
        case '특정판매자':
          targetCount = 1;
          break;
      }

      const newNotification: PushNotification = {
        id: String(Date.now()),
        title: values.title,
        message: values.message,
        targetType: values.targetType,
        targetDetail: values.targetDetail,
        scheduledAt: values.scheduledAt.format('YYYY-MM-DD HH:mm'),
        targetCount,
        status: '발송예정',
        createdAt: dayjs().format('YYYY-MM-DD'),
      };

      setNotifications(prev => [newNotification, ...prev]);
      message.success('푸시 알림이 예약되었습니다.');
      setModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: '발송 취소',
      content: '이 푸시 알림 발송을 취소하시겠습니까?',
      okText: '취소하기',
      okType: 'danger',
      cancelText: '닫기',
      onOk: () => {
        setNotifications(prev => prev.map(n =>
          n.id === id ? { ...n, status: '취소' as const } : n
        ));
        message.success('발송이 취소되었습니다.');
      },
    });
  };

  const handleViewDetail = (notification: PushNotification) => {
    setSelectedNotification(notification);
    setDetailModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '발송완료': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case '발송예정': return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      case '발송실패': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case '취소': return <CloseCircleOutlined style={{ color: '#999' }} />;
      default: return null;
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case '전체고객':
      case '특정고객':
      case '코호트':
        return <UserOutlined />;
      case '전체판매자':
      case '특정판매자':
        return <ShopOutlined />;
      default:
        return <TeamOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '발송완료': return 'green';
      case '발송예정': return 'blue';
      case '발송실패': return 'red';
      case '취소': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: PushNotification) => (
        <a onClick={() => handleViewDetail(record)}>{title}</a>
      ),
    },
    {
      title: '대상',
      key: 'target',
      render: (_: unknown, record: PushNotification) => (
        <Space>
          {getTargetIcon(record.targetType)}
          <span>{record.targetType}</span>
          {record.targetDetail && (
            <Tag>{record.targetDetail}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '대상 수',
      dataIndex: 'targetCount',
      key: 'targetCount',
      render: (count: number) => `${count.toLocaleString()}명`,
    },
    {
      title: '발송 시간',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
    },
    {
      title: '성공률',
      key: 'successRate',
      render: (_: unknown, record: PushNotification) => {
        if (record.status !== '발송완료' || !record.successCount) return '-';
        const rate = ((record.successCount / record.targetCount) * 100).toFixed(1);
        return <Text type={Number(rate) >= 95 ? 'success' : 'warning'}>{rate}%</Text>;
      },
    },
    {
      title: '관리',
      key: 'action',
      width: 120,
      render: (_: unknown, record: PushNotification) => (
        <Space>
          <Button size="small" onClick={() => handleViewDetail(record)}>상세</Button>
          {record.status === '발송예정' && (
            <Button size="small" danger onClick={() => handleCancel(record.id)}>취소</Button>
          )}
        </Space>
      ),
    },
  ];

  // 통계
  const stats = useMemo(() => {
    const sent = notifications.filter(n => n.status === '발송완료');
    const scheduled = notifications.filter(n => n.status === '발송예정').length;
    const totalSent = sent.reduce((sum, n) => sum + (n.successCount || 0), 0);
    const avgSuccessRate = sent.length > 0
      ? (sent.reduce((sum, n) => sum + ((n.successCount || 0) / n.targetCount * 100), 0) / sent.length).toFixed(1)
      : 0;
    return { sentCount: sent.length, scheduled, totalSent, avgSuccessRate };
  }, [notifications]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>푸시 알림</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          새 푸시 알림
        </Button>
      </div>

      {/* 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="발송 완료" value={stats.sentCount} suffix="건" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="발송 예정" value={stats.scheduled} suffix="건" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="총 발송 수" value={stats.totalSent} suffix="건" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="평균 성공률" value={stats.avgSuccessRate} suffix="%" valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      {/* 필터 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <Space>
            <Text>상태:</Text>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              options={[
                { label: '전체', value: '전체' },
                { label: '발송완료', value: '발송완료' },
                { label: '발송예정', value: '발송예정' },
                { label: '발송실패', value: '발송실패' },
                { label: '취소', value: '취소' },
              ]}
            />
          </Space>
          <Space>
            <Text>대상:</Text>
            <Select
              value={targetFilter}
              onChange={setTargetFilter}
              style={{ width: 150 }}
              options={[
                { label: '전체', value: '전체' },
                { label: '전체고객', value: '전체고객' },
                { label: '특정고객', value: '특정고객' },
                { label: '코호트', value: '코호트' },
                { label: '전체판매자', value: '전체판매자' },
                { label: '특정판매자', value: '특정판매자' },
              ]}
            />
          </Space>
        </Space>
      </Card>

      {/* 테이블 */}
      <Card>
        <Table
          dataSource={filteredNotifications}
          columns={columns}
          rowKey="id"
          pagination={{
            total: filteredNotifications.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
        />
      </Card>

      {/* 푸시 알림 생성 모달 */}
      <Modal
        title="새 푸시 알림"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText="발송 예약"
        cancelText="취소"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="targetType"
            label="발송 대상"
            rules={[{ required: true, message: '발송 대상을 선택해주세요' }]}
          >
            <Select onChange={handleTargetTypeChange}>
              <Select.OptGroup label="고객">
                <Select.Option value="전체고객">전체 고객</Select.Option>
                <Select.Option value="특정고객">특정 고객</Select.Option>
                <Select.Option value="코호트">코호트 (고객 그룹)</Select.Option>
              </Select.OptGroup>
              <Select.OptGroup label="판매자">
                <Select.Option value="전체판매자">전체 판매자</Select.Option>
                <Select.Option value="특정판매자">특정 판매자</Select.Option>
              </Select.OptGroup>
            </Select>
          </Form.Item>

          {targetType === '코호트' && (
            <Form.Item
              name="targetDetail"
              label="코호트 선택"
              rules={[{ required: true, message: '코호트를 선택해주세요' }]}
            >
              <Select placeholder="코호트 선택">
                {mockCohorts.map(cohort => (
                  <Select.Option key={cohort.id} value={cohort.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{cohort.name}</span>
                      <Text type="secondary">{cohort.memberCount.toLocaleString()}명</Text>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {targetType === '특정고객' && (
            <Form.Item
              name="targetDetail"
              label="고객 검색"
              rules={[{ required: true, message: '고객을 선택해주세요' }]}
            >
              <div>
                <Search
                  placeholder="고객명 또는 전화번호로 검색"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                {searchedCustomers.length > 0 && (
                  <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, maxHeight: 150, overflow: 'auto' }}>
                    {searchedCustomers.map(c => (
                      <div
                        key={c.id}
                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                        onClick={() => handleSelectTarget(c.phone)}
                      >
                        <Text strong>{c.nickname}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>{c.phone}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Item>
          )}

          {targetType === '특정판매자' && (
            <Form.Item
              name="targetDetail"
              label="판매자 검색"
              rules={[{ required: true, message: '판매자를 선택해주세요' }]}
            >
              <div>
                <Search
                  placeholder="가게명 또는 전화번호로 검색"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                {searchedStores.length > 0 && (
                  <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, maxHeight: 150, overflow: 'auto' }}>
                    {searchedStores.map(s => (
                      <div
                        key={s.id}
                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                        onClick={() => handleSelectTarget(s.name)}
                      >
                        <Text strong>{s.name}</Text>
                        <Text type="secondary" style={{ marginLeft: 8 }}>{s.ownerPhone}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Item>
          )}

          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: '제목을 입력해주세요' }]}
          >
            <Input placeholder="푸시 알림 제목" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="message"
            label="메시지"
            rules={[{ required: true, message: '메시지를 입력해주세요' }]}
          >
            <TextArea placeholder="푸시 알림 내용" maxLength={200} showCount rows={4} />
          </Form.Item>

          <Form.Item
            name="scheduledAt"
            label="발송 시간"
            rules={[{ required: true, message: '발송 시간을 선택해주세요' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 상세 보기 모달 */}
      <Modal
        title="푸시 알림 상세"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>닫기</Button>,
        ]}
        width={500}
      >
        {selectedNotification && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag icon={getStatusIcon(selectedNotification.status)} color={getStatusColor(selectedNotification.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                {selectedNotification.status}
              </Tag>
            </div>
            <Title level={5}>{selectedNotification.title}</Title>
            <Paragraph>{selectedNotification.message}</Paragraph>
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">발송 대상</Text>
                  <div>{selectedNotification.targetType}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">대상 상세</Text>
                  <div>{selectedNotification.targetDetail || '-'}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">대상 수</Text>
                  <div>{selectedNotification.targetCount.toLocaleString()}명</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">발송 성공</Text>
                  <div>{selectedNotification.successCount?.toLocaleString() || '-'}명</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">예약 시간</Text>
                  <div>{selectedNotification.scheduledAt}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">발송 시간</Text>
                  <div>{selectedNotification.sentAt || '-'}</div>
                </Col>
                <Col span={24}>
                  <Text type="secondary">생성일</Text>
                  <div>{selectedNotification.createdAt}</div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
