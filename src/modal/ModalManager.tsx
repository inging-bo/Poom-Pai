import React from "react";
import ModalEditMode from './ModalEditMode.js';
import ModalParticipantList from './ModalParticipantList.tsx';
import ModalNotice from './ModalNotice.tsx'

import { useModalStore } from '../store/modalStore.ts';

// 모달 타입과 컴포넌트 매핑
const MODAL_COMPONENTS = {
  ModalEditMode,
  ModalParticipantList,
  ModalNotice,
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