import { create } from 'zustand';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase.ts";
import { ERRORS, SUCCESS } from "@/constant/contant.ts";
import { v4 } from "uuid";

const COLLECTION_NAME = "MeetList";

// --- 타입 정의 ---
export interface MeetFormData {
  meetTitle: string; // 모임 이름
  meetEntryCode: string; // 입장 코드
  meetEditCode: string; // 수정 코드
}

export interface Person {
  userId: string; // 유저 ID
  userName: string; // 유저 이름
  upFrontPayment: number; // 선입금
}

export interface UseHistoryDetails {
  placeItemId: string; // 세부 ID
  placeItemName: string; // 세부 사용명
  placeItemPrice: number; // 세부 사용 금액
  placeItemExcludeUser: string[]; // 세부 항목별 제외 인원
}

export interface UseHistory {
  placeId: string; // 장소 ID
  placeName: string; // 장소 명
  placeTotalPrice: number; // 장소별 전체 사용 금액
  placeExcludeUser: string[]; // 장소 전체에서 아예 빠지는 인원
  placeDetails: UseHistoryDetails[];
}

interface DataState {
  currentMeetCode: string | null;
  meetTitle: string;
  people: Person[];
  useHistory: UseHistory[];
  meetEditCode: string;
  dbData: { people: Person[]; history: UseHistory[] };
  isEdit: boolean;

  // Actions
  toggleEditMode: (value: boolean) => void;
  enterMeet: (code: string) => Promise<boolean>;
  createMeet: (formData: MeetFormData) => Promise<{ success: boolean; message: string }>;
  updatePeople: (newPeople: Person[]) => void;
  updateHistory: (newHistory: UseHistory[]) => void;
  fetchData: () => void;
  saveAllData: () => Promise<void>;
  cancelEdit: () => void;
  resetAllData: () => void;

  // Selectors
  getTotals: () => { totalMoney: number; totalUse: number; haveMoney: number };
  getBalances: () => Record<string, number>;
}

const findDocByCode = async (code: string) => {

  const q = query(collection(db, COLLECTION_NAME), where("meetEntryCode", "==", code));
  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    return null;
  }

  return querySnap.docs[0];
};

export const useDataStore = create<DataState>((set, get) => ({
  currentMeetCode: null,
  meetTitle: "",
  people: [],
  useHistory: [],
  meetEditCode: "",
  dbData: { people: [], history: [] },
  isEdit: false,
  toggleEditMode: (value) => set({ isEdit: value }),

  // 내용 초기화
  resetAllData: () => set({
    currentMeetCode: null,
    meetTitle: "",
    people: [],
    useHistory: [],
    meetEditCode: "",
    dbData: { people: [], history: [] },
    isEdit: false
  }),

  // 수정 이전 으로
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
      const rawHistory: UseHistory[] = data.history || [];

      // DB 필드명과 인터페이스 필드명 동기화 체크
      const cleanHistory = (rawHistory || []).map(h => ({
        placeId: h.placeId || v4(),
        placeName: h.placeName || "",
        placeTotalPrice: Number(h.placeTotalPrice) || 0,
        placeExcludeUser: h.placeExcludeUser || [],
        placeDetails: (h.placeDetails || []).map((d) => ({
          placeItemId: d.placeItemId || v4(),
          placeItemName: d.placeItemName || "",
          placeItemPrice: Number(d.placeItemPrice) || 0,
          placeItemExcludeUser: d.placeItemExcludeUser || []
        }))
      }));

      set({
        meetTitle: data.meetTitle || "여기가 왜 보이면 안돼요",
        currentMeetCode: code,
        people: cleanPeople,
        useHistory: cleanHistory,
        meetEditCode: data.meetEditCode || "",
        dbData: {
          people: structuredClone(cleanPeople),
          history: structuredClone(cleanHistory)
        }
      });
      return true;
    }
    return false;
  },

  /* 새로운 모임 등록 */
  createMeet: async (formData) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, formData.meetTitle);
      const nameSnap = await getDoc(docRef);
      if (nameSnap.exists()) return { success: false, message: ERRORS.DUPLICATED_NAME };

      const codeSnap = await findDocByCode(formData.meetEntryCode);
      if (codeSnap) return { success: false, message: ERRORS.DUPLICATED_CODE };

      await setDoc(docRef, {
        meetTitle: formData.meetTitle,
        meetEntryCode: formData.meetEntryCode,
        meetEditCode: formData.meetEditCode,
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

  /* 새로고침 */
  fetchData: async () => {
    const { currentMeetCode } = get();
    if (!currentMeetCode) return;

    try {
      const docSnap = await findDocByCode(currentMeetCode);
      if (docSnap) {
        const data = docSnap.data();
        const cleanPeople = data.people || [];
        const rawHistory: UseHistory[] = data.history || [];

        const cleanHistory = (rawHistory || []).map(h => ({
          placeId: h.placeId || v4(),
          placeName: h.placeName || "",
          placeTotalPrice: Number(h.placeTotalPrice) || 0,
          placeExcludeUser: h.placeExcludeUser || [],
          placeDetails: (h.placeDetails || []).map((d) => ({
            placeItemId: d.placeItemId || v4(),
            placeItemName: d.placeItemName || "",
            placeItemPrice: Number(d.placeItemPrice) || 0,
            placeItemExcludeUser: d.placeItemExcludeUser || []
          }))
        }));

        set({
          people: cleanPeople,
          useHistory: cleanHistory,
          dbData: {
            people: structuredClone(cleanPeople),
            history: structuredClone(cleanHistory)
          }
        });
      }
    } catch (error) {
      console.error("데이터 동기화 실패:", error);
    }
  },

  /* 저장 */
  saveAllData: async () => {
    const { people, useHistory, currentMeetCode } = get();
    if (!currentMeetCode) return;

    const filterPeople = people.filter(p => p.userName.trim() !== "");
    const filterHistory = useHistory.filter(h => h.placeName.trim() !== "");

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
          isEdit: false,
          dbData: {
            people: JSON.parse(JSON.stringify(filterPeople)),
            history: JSON.parse(JSON.stringify(filterHistory))
          }
        });
      }
    } catch (error) {
      console.error("데이터 저장 실패:", error);
      throw error;
    }
  },

  getTotals: () => {
    const { people, useHistory } = get();

    // 총 경비: 사람들이 낸 선입금의 총합
    const totalMoney = people.reduce((acc, cur) => acc + (Number(cur.upFrontPayment) || 0), 0);

    // 총 사용 금액: 각 장소의 placeTotalPrice 총합
    const totalUse = useHistory.reduce((acc, place) => acc + (Number(place.placeTotalPrice) || 0), 0);

    return { totalMoney, totalUse, haveMoney: totalMoney - totalUse };
  },

  // 상세 정산 로직: 항목별 제외 + 미분류 잔액 처리
  getBalances: () => {
    const { people, useHistory } = get();
    const balances: Record<string, number> = {};
    const activePeople = people.filter(p => p.userName.trim() !== "");

    useHistory.forEach(place => {
      const placeExcludes = place.placeExcludeUser || [];
      // 해당 장소에 참여한 사람들 (장소 제외자 필터링)
      const placeParticipants = activePeople.filter(p => !placeExcludes.includes(p.userId));

      if (placeParticipants.length === 0) return;

      let totalDetailsPrice = 0;

      // 세부 항목별 정산 (고기, 술 등 특정 인원만 먹은 것)
      (place.placeDetails || []).forEach(item => {
        const itemExcludes = item.placeItemExcludeUser || [];
        // 항목 참여자 = 장소 참여자 중 항목 제외자 뺀 사람
        const itemTargets = placeParticipants.filter(p => !itemExcludes.includes(p.userId));

        if (itemTargets.length > 0) {
          const price = Number(item.placeItemPrice) || 0;
          totalDetailsPrice += price;
          const divided = price / itemTargets.length;

          itemTargets.forEach(p => {
            balances[p.userId] = (balances[p.userId] || 0) + divided;
          });
        }
      });

      // 미분류 잔액 정산 (장소 전체 금액 - 세부 항목 합계)
      // 예: 10만원 결제했는데 세부내역은 8만원만 적었다면, 남은 2만원은 해당 장소 참여자 전원이 1/n
      const remaining = (Number(place.placeTotalPrice) || 0) - totalDetailsPrice;
      if (remaining > 0) {
        // 남은 금액은 장소 참여자(placeParticipants) 전원이 n분의 1
        const dividedRemaining = remaining / placeParticipants.length;
        placeParticipants.forEach(p => {
          balances[p.userId] = (balances[p.userId] || 0) + dividedRemaining;
        });
      }
    });

    return balances;
  }
}));