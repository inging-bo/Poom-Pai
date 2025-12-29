import { create } from 'zustand';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase.ts";
import { ERRORS, SUCCESS } from "@/constant/contant.ts";
import { v4 } from "uuid";

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

export interface SubItem {
  id: string;
  name: string;
  price: number;
  excludeUser: string[];
}

export interface UseHistory {
  placeId: string;
  name: string;
  totalPrice: number; // 🔥 장소별 전체 사용 금액 (선금/결제금액)
  details: {
    id: string;
    name: string;
    price: number;
    excludeUser: string[]; // 세부 항목별 제외 인원
  }[];
  excludeUser: string[]; // 🔥 장소 전체에서 아예 빠지는 인원
}

interface DataState {
  currentMeetCode: string | null;
  meetTitle: string;
  people: Person[];
  useHistory: UseHistory[];
  meetEditCode: number;
  dbData: { people: Person[]; history: UseHistory[] };
  isEdit: boolean;

  // Actions
  toggleEditMode: (value: boolean) => void;
  enterMeet: (code: string) => Promise<boolean>;
  createMeet: (formData: MeetFormData) => Promise<{ success: boolean; message: string }>;
  updatePeople: (newPeople: Person[]) => void;
  updateHistory: (newHistory: UseHistory[]) => void;
  saveAllData: () => Promise<void>;
  cancelEdit: () => void;
  resetAllData: () => void;

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
      const rawHistory = data.history || [];
      const cleanHistory = rawHistory.map((h: UseHistory) => ({
        placeId: h.placeId || v4(),
        name: h.name || "",
        // 🔥 만약 details가 없으면 기본 구조를 만들어서 넣어줌
        details: h.details || [
          { id: v4(), name: "기본 항목", price: h.useMoney || 0, excludeUser: h.excludeUser || [] }
        ]
      }));

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

    // 1. 총 경비 계산
    const totalMoney = people.reduce((acc, cur) => acc + (Number(cur.givePay) || 0), 0);

    // 2. 총 사용 금액 계산 (details가 없을 경우를 대비한 방어 로직)
    const totalUse = useHistory.reduce((acc, place) => {
      // details가 없으면 0을 더하고 넘어감
      const subTotal = (place.details || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
      return acc + subTotal;
    }, 0);

    return { totalMoney, totalUse, haveMoney: totalMoney - totalUse };
  },

  getBalances: () => {
    const { people, useHistory } = get();
    const balances: Record<string, number> = {};
    const activePeople = people.filter(p => p.name.trim() !== "");

    useHistory.forEach(place => {
      // 🔥 place.details가 존재할 때만 순회하도록 변경
      (place.details || []).forEach(item => {
        const targets = activePeople.filter(p => !(item.excludeUser || []).includes(p.userId));
        if (targets.length > 0) {
          const divided = (Number(item.price) || 0) / targets.length;
          targets.forEach(p => {
            balances[p.userId] = (balances[p.userId] || 0) + divided;
          });
        }
      });
    });
    return balances;
  }
}));