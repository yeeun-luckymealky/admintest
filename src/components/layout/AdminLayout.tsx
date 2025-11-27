'use client';

import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  StarOutlined,
  SettingOutlined,
  HomeOutlined,
  WarningOutlined,
  PictureOutlined,
  GiftOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import type { MenuProps } from 'antd';

const { Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems: MenuProps['items'] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '대시보드',
  },
  {
    key: '/stores/settings',
    icon: <HomeOutlined />,
    label: '가게설정',
  },
  {
    key: '/customers',
    icon: <UserOutlined />,
    label: '유저 관리',
  },
  {
    key: '/stores',
    icon: <ShopOutlined />,
    label: '가게 관리',
  },
  {
    key: '/orders',
    icon: <ShoppingCartOutlined />,
    label: '주문 관리',
  },
  {
    key: '/settlements',
    icon: <DollarOutlined />,
    label: '정산 관리',
  },
  {
    key: '/reviews',
    icon: <StarOutlined />,
    label: '리뷰 관리',
  },
  {
    key: '/reports',
    icon: <WarningOutlined />,
    label: '신고/블랙리스트',
  },
  {
    type: 'divider',
  },
  {
    key: '/banners',
    icon: <PictureOutlined />,
    label: '배너 관리',
  },
  {
    key: '/coupons',
    icon: <GiftOutlined />,
    label: '쿠폰 관리',
  },
  {
    key: '/push',
    icon: <NotificationOutlined />,
    label: '푸시 알림',
  },
  {
    type: 'divider',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '설정',
  },
];

const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    label: '프로필',
  },
  {
    key: 'logout',
    label: '로그아웃',
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(e.key);
  };

  // 현재 경로에 맞는 메뉴 키 찾기
  const getSelectedKey = () => {
    if (pathname === '/') return '/';
    const matchedItem = menuItems?.find(
      (item) => item?.key !== '/' && pathname.startsWith(item?.key as string)
    );
    return matchedItem?.key as string || '/';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
        width={220}
      >
        {/* 로고 영역 */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{
            color: '#22c55e',
            fontWeight: 700,
            fontSize: collapsed ? 14 : 20,
            textAlign: collapsed ? 'center' : 'left',
          }}>
            {collapsed ? 'LM' : 'Luckymeal'}
          </div>
          {!collapsed && (
            <div style={{ color: '#666', fontSize: 12 }}>Admin Console</div>
          )}
        </div>

        {/* 메뉴 */}
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            marginTop: 8,
          }}
        />

        {/* 하단 사용자 정보 */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            right: 0,
            padding: '12px 16px',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Dropdown menu={{ items: userMenuItems }} placement="topRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Avatar size="small" icon={<UserOutlined />} />
              {!collapsed && <span style={{ fontSize: 14 }}>운영자</span>}
            </div>
          </Dropdown>
        </div>
      </Sider>

      <Layout>
        <Content
          style={{
            padding: 24,
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 48px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
