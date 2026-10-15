import { useEffect } from "react";
import { App as AntdApp } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

let messageApi: MessageInstance | null = null;

/** 全局消息 API，业务代码直接 import { toast } 调用，底层是 antd message（自动带主题色与动画） */
export const toast = {
  success: (message: string) => messageApi?.success(message),
  error: (message: string) => messageApi?.error(message),
  info: (message: string) => messageApi?.info(message),
};

/** 挂在根组件 <App> 内部一次，把 antd message 实例桥接给上面的 toast */
export function ToastBridge() {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    messageApi = message;
  }, [message]);

  return null;
}
