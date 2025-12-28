import { create } from 'zustand';
import { v4 } from 'uuid';

/** * 🔥 ModalData 슬림화
 * 모달 타입별로 필요한 핵심 데이터만 남기고,
 * 복잡한 상태 업데이트 함수들은 모달 컴포넌트 내부에서 스토어를 호출하도록 유도합니다.
 */
export interface ModalData {
  // 공통
  title?: string;
  modalId?: string;

  // ModalNotice (알림창)
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;

  // ModalParticipantList (제외 인원 설정)
  placeId?: string; // 어떤 지출 내역인지 식별
  placeName?: string; // 모달 헤더에 표시할 이름

  // ModalEditMode (비밀번호 확인)
  setIsEdit?: (val: boolean) => void;
}

export type ModalType = 'ModalEditMode' | 'ModalParticipantList' | 'ModalNotice';

export interface ModalItem {
  modalId: string;
  type: ModalType;
  data: ModalData;
}

interface ModalState {
  modals: ModalItem[];
  openModal: (type: ModalType, data: ModalData) => string;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modals: [],

  openModal: (type, data) => {
    const modalId = v4();
    set((state) => {
      // 하나만 열려야 하는 모달 로직
      const allowOnlyOne = ['ModalParticipantList', 'ModalEditMode'];
      let newModals = state.modals;

      if (allowOnlyOne.includes(type)) {
        newModals = state.modals.filter((m) => m.type !== type);
      }

      return {
        modals: [...newModals, { modalId, type, data }],
      };
    });
    return modalId;
  },

  closeModal: (modalId) => set((state) => ({
    modals: state.modals.filter((m) => m.modalId !== modalId)
  })),

  closeAllModals: () => set({ modals: [] }),
}));