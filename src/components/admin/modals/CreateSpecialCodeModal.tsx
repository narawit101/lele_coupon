"use client";

import React, { useState } from "react";
import SpecialCodeModal, { SpecialCodeModalProps } from "./SpecialCodeModal";

export type CreateSpecialCodeModalProps = Omit<
  SpecialCodeModalProps,
  "editingCode" | "codeActive" | "setCodeActive" | "onDelete"
>;

export default function CreateSpecialCodeModal(props: CreateSpecialCodeModalProps) {
  const [, setDummyActive] = useState(true);
  return (
    <SpecialCodeModal
      {...props}
      editingCode={null}
      codeActive={true}
      setCodeActive={setDummyActive}
    />
  );
}
