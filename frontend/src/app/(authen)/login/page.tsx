"use client";
import React from "react";
import { Form, Input, Button } from "antd";
import { useMutation } from "@tanstack/react-query";
import { getLoginToken } from "@/services/users/user.services";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/provider/global.Context";

const LoginPage: React.FC = () => {
  const Router = useRouter();
  const global = useGlobal();
  const api = {
    login: useMutation({
      mutationKey: ["Login"],
      mutationFn: getLoginToken,
    }),
  };
  const onFinish = async (values: { code: string; password: string }) => {
    const data = await api.login.mutateAsync(values);
    if (data.token && data.userInfo) {
      localStorage.setItem("token", data.token);
      global.dispatch({
        type: "SET_INIT",
        payload: {
          centerID: values.code,
          user_meet: data.userInfo.data.id,
          name: data.userInfo.data.name,
          user_id: data.userInfo.userID,
          token: data.token,
        },
      });
      Router.push("/chat");
    }
  };

  return (
    <div className="p-4 w-full max-w-md mx-auto">
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
            Đăng nhập
          </Button>
        </Form.Item>
        <small>Sử dụng tài khoản meet để truy cập</small>
      </Form>
    </div>
  );
};

export default LoginPage;
