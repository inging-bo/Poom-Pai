// store/modalStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
// Zustand 스토어 생성
export const useModalStore = create( (set) => ({
  modals: [],
  modalIsLoading: false, // ✅ 추가
  openModal: (type, data = {}) => {
    const modalId = uuidv4();  // 대체
    set( (state) => ({
      modals: [...state.modals, { modalId, type, data }],
    }) );
    return modalId; // ✅ modalId 반환 추가
  },
  closeModal: (modalId) => {
    set( (state) => ({
      modals: state.modals.filter( (modal) => modal.modalId !== modalId ),
    }) );
  },
  closeAllModals: () => {
    set( { modals: [] } );
  },
  setModalIsLoading: (loading) => set( { modalIsLoading: loading } ), // ✅ setter 추가
}) );
