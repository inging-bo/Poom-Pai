import React from "react";
import ModalEditMode from './ModalEditMode';
import ModalParticipantList from './ModalParticipantList';
import ModalNotice from './ModalNotice';
import ModalDetail from './ModalDetail';
import { useModalStore, type ModalData } from '../store/modalStore.ts';
import { AnimatePresence } from "framer-motion";

const MODAL_COMPONENTS: Record<string, React.ComponentType<ModalData>> = {
  ModalEditMode,
  ModalParticipantList,
  ModalNotice,
  ModalDetail
};

const ModalManager = () => {
  const { modals } = useModalStore();

  return (
    <AnimatePresence>
      {modals.map(({ modalId, type, data }) => {
        const ModalComponent = MODAL_COMPONENTS[type];
        if (!ModalComponent) return null;

        // ✅ modalId를 데이터와 합쳐서 전달 (ModalData 타입에 부합함)
        return <ModalComponent key={modalId} {...data} modalId={modalId} />;
      })}
    </AnimatePresence>
  );
};

export default ModalManager;