'use client';

import React from 'react';
import { Card, Typography, Form, Input, Switch, Button, Divider, Space, message } from 'antd';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('설정이 저장되었습니다.');
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>설정</Title>

      <Card title="알림 설정" style={{ marginBottom: 16 }}>
        <Form layout="vertical" form={form}>
          <Form.Item label="이메일 알림" name="emailNotification" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <Text type="secondary">새로운 가게 심사 요청, 신고 접수 시 이메일로 알림을 받습니다.</Text>

          <Divider />

          <Form.Item label="슬랙 알림" name="slackNotification" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <Text type="secondary">긴급 처리가 필요한 항목 발생 시 슬랙으로 알림을 받습니다.</Text>
        </Form>
      </Card>

      <Card title="계정 설정" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Form.Item label="이름" name="name" initialValue="운영자">
            <Input style={{ width: 300 }} />
          </Form.Item>
          <Form.Item label="이메일" name="email" initialValue="admin@luckymeal.co.kr">
            <Input style={{ width: 300 }} />
          </Form.Item>
          <Form.Item label="연락처" name="phone" initialValue="010-1234-5678">
            <Input style={{ width: 300 }} />
          </Form.Item>
        </Form>
      </Card>

      <Card title="시스템 설정">
        <Form layout="vertical">
          <Form.Item label="기본 정산 수수료율 (%)" name="feeRate" initialValue="3.5">
            <Input style={{ width: 150 }} suffix="%" />
          </Form.Item>
          <Form.Item label="자동 정산 주기" name="settlementCycle" initialValue="주 1회">
            <Input style={{ width: 150 }} />
          </Form.Item>
        </Form>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button>취소</Button>
          <Button type="primary" onClick={handleSave}>저장</Button>
        </Space>
      </div>
    </div>
  );
}
