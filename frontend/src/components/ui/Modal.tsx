import { Modal as AntModal } from "antd";

export interface ModalProps {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  width?: string | number;
  children: React.ReactNode;
  /** 关闭时是否销毁内部表单状态，默认 true */
  destroyOnClose?: boolean;
}

export function Modal({
  open,
  title,
  onClose,
  footer,
  width = 520,
  children,
  destroyOnClose = true,
}: ModalProps) {
  return (
    <AntModal
      open={open}
      title={title}
      onCancel={onClose}
      footer={footer ?? null}
      width={width}
      maskClosable
      destroyOnClose={destroyOnClose}
    >
      {children}
    </AntModal>
  );
}
