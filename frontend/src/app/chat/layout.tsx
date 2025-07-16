"use client";
import React from "react";
import { Layout } from "antd";

const { Content } = Layout;

export default function LayoutChat({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout hasSider>
      <Layout>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
}
