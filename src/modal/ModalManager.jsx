import React from "react";
import ModalEditMode from './ModalEditMode.jsx';
import ModalParticipantList from './ModalParticipantList.jsx';

import { useModalStore } from '../store/modalStore.js';

// 모달 타입과 컴포넌트 매핑
const MODAL_COMPONENTS = {
  ModalEditMode,
  ModalParticipantList,
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