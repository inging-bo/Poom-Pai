import { create } from 'zustand';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase.ts";
import { ERRORS, SUCCESS } from "@/constant/contant.ts";

const COLLECTION_NAME = "MeetList";

// --- 타입 정의 ---
export interface MeetFormData {
  name: string; // 모임 이름
  code: string; // 입장 코드
  edit: string; // 수정 코드
}

export interface Person {
  userId: string; // 유저 ID
  name: string; // 유저 이름
  givePay: number; // 선불 금액
}

export interface UseHistory {
  placeId: string;
  name: string;
  useMoney: number;
  excludeUser: string[];
}

interface DataState {
  currentMeetCode: string | null;
  meetTitle: string;
  people: Person[];
  useHistory: UseHistory[];
  meetEditCode: number;
  dbData: { people: Person[]; history: UseHistory[] };
  isEdit: boolean;
  resetAllData: () => void;

  // Actions
  enterMeet: (code: string) => Promise<boolean>;
  createMeet: (formData: MeetFormData) => Promise<{ success: boolean; message: string }>;
  updatePeople: (newPeople: Person[]) => void;
  updateHistory: (newHistory: UseHistory[]) => void;
  saveAllData: () => Promise<void>;
  toggleEditMode: (value: boolean) => void;
  cancelEdit: () => void;

  // Selectors
  getTotals: () => { totalMoney: number; totalUse: number; haveMoney: number };
  getBalances: () => Record<string, number>;
}

/** 헬퍼 함수: 코드로 문서 스냅샷 찾기 */
const findDocByCode = async (code: string) => {
  const q = query(collection(db, COLLECTION_NAME), where("code", "==", code));
  const querySnap = await getDocs(q);
  return querySnap.empty ? null : querySnap.docs[0];
};

export const useDataStore = create<DataState>((set, get) => ({
  currentMeetCode: null,
  meetTitle: "",
  people: [],
  useHistory: [],
  meetEditCode: 0,
  dbData: { people: [], history: [] },
  isEdit: false,
  toggleEditMode: (value) => set({ isEdit: value }),

  resetAllData: () => set({
    currentMeetCode: null,
    meetTitle: "",
    people: [],
    useHistory: [],
    meetEditCode: 0,
    dbData: { people: [], history: [] },
    isEdit: false
  }),

  cancelEdit: () => {
    const { dbData } = get();
    set({
      people: [...dbData.people],
      useHistory: [...dbData.history],
      isEdit: false
    });
  },

  // 입장 시 currentMeetCode를 함께 저장
  enterMeet: async (code) => {
    const docSnap = await findDocByCode(code);
    if (docSnap) {
      const data = docSnap.data();
      const cleanPeople = data.people || [];
      const cleanHistory = data.history || [];

      set({
        meetTitle: data.name || "이름 없는 모임",
        currentMeetCode: code,
        people: cleanPeople,
        useHistory: cleanHistory,
        meetEditCode: Number(data.edit) || 0,
        dbData: {
          people: [...cleanPeople],
          history: [...cleanHistory]
        }
      });
      return true;
    }
    return false;
  },

  createMeet: async (formData) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, formData.name);
      const nameSnap = await getDoc(docRef);
      if (nameSnap.exists()) return { success: false, message: ERRORS.DUPLICATED_NAME };

      const codeSnap = await findDocByCode(formData.code);
      if (codeSnap) return { success: false, message: ERRORS.DUPLICATED_CODE };

      await setDoc(docRef, {
        name: formData.name,
        code: formData.code,
        edit: formData.edit,
        people: [],
        history: [],
        createdAt: new Date().toISOString()
      });
      return { success: true, message: SUCCESS.CREATE };
    } catch (error) {
      console.error(error);
      return { success: false, message: ERRORS.SAVE_FAILED };
    }
  },

  updatePeople: (newPeople) => set({ people: newPeople }),
  updateHistory: (newHistory) => set({ useHistory: newHistory }),

  saveAllData: async () => {
    const { people, useHistory, currentMeetCode } = get();
    if (!currentMeetCode) return;

    const filterPeople = people.filter(p => p.name.trim() !== "");
    const filterHistory = useHistory.filter(h => h.name.trim() !== "");

    try {
      const docSnap = await findDocByCode(currentMeetCode);
      if (docSnap) {
        await updateDoc(docSnap.ref, {
          people: filterPeople,
          history: filterHistory,
          updatedAt: new Date().toISOString(),
        });

        // 저장 성공 후 화면 데이터와 원본(dbData) 동기화
        set({
          people: filterPeople,
          useHistory: filterHistory,
          dbData: { people: [...filterPeople], history: [...filterHistory] }
        });
      }
    } catch (error) {
      console.error("데이터 저장 실패:", error);
      throw error;
    }
  },

  getTotals: () => {
    const { people, useHistory } = get();
    const totalMoney = people.reduce((acc, cur) => acc + (cur.givePay || 0), 0);
    const totalUse = useHistory.reduce((acc, cur) => acc + (cur.useMoney || 0), 0);
    return { totalMoney, totalUse, haveMoney: totalMoney - totalUse };
  },

  getBalances: () => {
    const { people, useHistory } = get();
    const realUsers = people.filter(p => p.name.trim() !== "");
    const balances: Record<string, number> = {};

    useHistory.forEach(list => {
      const targets = realUsers.filter(p => !(list.excludeUser || []).includes(p.userId));
      if (targets.length <= 0) return;
      const dividedAmount = list.useMoney / targets.length;
      targets.forEach(p => balances[p.userId] = (balances[p.userId] || 0) + dividedAmount);
    });
    return balances;
  }
}));