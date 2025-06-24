"use client";
import React from "react";
import { Form, Input, Button } from "antd";
import { useMutation } from "@tanstack/react-query";
import { getLoginToken } from "@/services/users/user.services";

const LoginPage: React.FC = () => {
  const api = {
    login: useMutation({
      mutationKey: ["Login"],
      mutationFn: getLoginToken,
      onSuccess: (data) => {},
    }),
  };
  const onFinish = async (values: {
    code: string;
    username: string;
    password: string;
  }) => {
    api.login.mutateAsync(values);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #f0f1f2",
      }}
    >
      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Mã cơ sở đào tạo"
          name="code"
          rules={[
            { required: true, message: "Xin hãy nhập mã cơ sở đào tạo!" },
          ]}
        >
          <Input placeholder="Enter your username" />
        </Form.Item>
        <Form.Item
          label="Tài khoản"
          name="username"
          rules={[{ required: true, message: "Xin hãy nhập tài khoán!" }]}
        >
          <Input placeholder="Enter your username" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={api.login.isPending}
          >
            Login
          </Button>
        </Form.Item>
        <small>Sử dụng tài khoản meet để truy cập</small>
      </Form>
    </div>
  );
};

export default LoginPage;
