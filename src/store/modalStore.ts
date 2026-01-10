import { create } from 'zustand';
import { v4 } from 'uuid';

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
  subItemId?: string;
  isPlaceLevel?: boolean;

  // ModalEditMode (비밀번호 확인)
  setIsEdit?: (val: boolean) => void;
}

export type ModalType = 'ModalEditMode' | 'ModalParticipantList' | 'ModalNotice' | 'ModalDetail';

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
      // 이미 같은 타입의 모달이 열려 있는지 확인
      const isAlreadyOpen = state.modals.some(m => m.type === type);

      // 'ModalEditMode' 같은 모달은 중복 생성을 원천 차단
      const allowOnlyOne = ['ModalParticipantList', 'ModalEditMode'];

      if (allowOnlyOne.includes(type) && isAlreadyOpen) {
        return state; // 기존 상태 유지 (아무것도 하지 않음)
      }

      return {
        modals: [...state.modals, { modalId, type, data }],
      };
    });
    return modalId;
  },

  closeModal: (modalId) => set((state) => ({
    modals: state.modals.filter((m) => m.modalId !== modalId)
  })),

  closeAllModals: () => set({ modals: [] }),
}));