import React from "react";
import ModalNotice from './ModalNotice.jsx';
import ModalEditMode from './ModalEditMode.jsx';

import { useModalStore } from '../store/modalStore.js';

// 모달 타입과 컴포넌트 매핑
const MODAL_COMPONENTS = {
  ModalNotice,       // ModalNotice 컴포넌트
  ModalEditMode,
  none: () => null,  // 모달이 없는 경우 (null 반환)
};

const ModalManager = () => {
  const { modals } = useModalStore();

  return (
    <>
      {modals.map( ({ modalId, type, data }) => {
        const ModalComponent = MODAL_COMPONENTS[type];
        if (!ModalComponent) return null;
        return <ModalComponent key={modalId} modalId={modalId} {...data} />;
      } )}
    </>
  );
};

export default ModalManager;