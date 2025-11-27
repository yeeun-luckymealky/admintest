import type { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import AdminLayout from '@/components/layout/AdminLayout';
import "./globals.css";

export const metadata: Metadata = {
  title: "Luckymeal Admin",
  description: "럭키밀 어드민 콘솔",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AntdRegistry>
          <ConfigProvider
            locale={koKR}
            theme={{
              token: {
                colorPrimary: '#22c55e',
              },
            }}
          >
            <AdminLayout>
              {children}
            </AdminLayout>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
