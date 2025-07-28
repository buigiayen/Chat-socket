import { InfoCircleFilled } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useState } from "react";

export default function ButtonInfoChat({
  userInfo,
}: {
  userInfo: UserChat.UserCenter;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [form] = Form.useForm<UserChat.UserCenter>();
  return (
    <div>
      <Button
        type="link"
        onClick={() => {
          setIsOpen(true);
        }}
        icon={<InfoCircleFilled />}
      ></Button>
      <Modal
        title="Thông tin tài khoản"
        open={isOpen}
        onCancel={() => {
          setIsOpen(false);
        }}
        okButtonProps={{ hidden: true }}
        cancelButtonProps={{ hidden: true }}
      >
        <Form
          initialValues={userInfo}
          form={form}
          labelAlign="left"
          labelCol={{ xs: "12" }}
        >
          <Form.Item label="Mã tài khoản" name={"userID"}>
            <Input variant="borderless"></Input>
          </Form.Item>
          <Form.Item
            label="Tên người dùng"
            name={"name"}
            labelCol={{ xs: "12" }}
          >
            <Input variant="borderless"></Input>
          </Form.Item>
          <Form.Item
            label="Mã trung tâm đào tạo"
            name={"centerID"}
            labelCol={{ xs: "12" }}
          >
            <Input variant="borderless"></Input>
          </Form.Item>
          {userInfo.isOnline && (
            <Form.Item
              label="Phiên hiện tại"
              name={"socketID"}
              labelCol={{ xs: "12" }}
            >
              <Input variant="borderless"></Input>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
