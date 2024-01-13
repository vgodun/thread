"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const AlertModal= ({
  isOpen,
  onClose,
  onConfirm,
  loading
}:AlertModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title="Delete post?"
      description="If you delete this post, you won't be able to restore it."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="cancle" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} variant="done" onClick={onConfirm}>Continue</Button>
      </div>
    </Modal>
  );
};