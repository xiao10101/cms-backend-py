import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  content: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** 危险操作（如删除）时确认按钮和图标显示为红色 */
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title = "操作确认",
  content,
  confirmText = "确定",
  cancelText = "取消",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      width={420}
      footer={
        <>
          <Button variant="outline" disabled={loading} onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <ExclamationCircleFilled
          className={danger ? "mt-0.5 text-xl text-red-500" : "mt-0.5 text-xl text-primary"}
        />
        <div className="text-sm leading-6 text-gray-600">{content}</div>
      </div>
    </Modal>
  );
}
