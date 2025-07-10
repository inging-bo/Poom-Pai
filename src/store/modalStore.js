// store/modalStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
// Zustand 스토어 생성
export const useModalStore = create( (set) => ({
  modals: [],
  modalIsLoading: false, // ✅ 추가
  openModal: (type, data = {}) => {
    const modalId = uuidv4();
    
    set((state) => {
      const allowOnlyOne = ['ModalParticipantList'];
      
      let newModals = state.modals;
      if (allowOnlyOne.includes(type)) {
        // 같은 타입 제거
        newModals = state.modals.filter((modal) => modal.type !== type);
      }
      
      return {
        modals: [...newModals, { modalId, type, data }],
      };
    });
    
    return modalId;
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
