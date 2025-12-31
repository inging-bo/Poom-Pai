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
  placePrevTotalPrice: number; // 세부 항목 선택 시 저장되는 기존 전체 사용 금액
  placeExcludeUser: string[]; // 장소 전체에서 아예 빠지는 인원
  isDetailMode?: boolean; // 세부 항목 모드 유무
  placeDetails: UseHistoryDetails[]; // 세부 항목 그룹
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

// --- 내부 헬퍼 함수 (중복 제거 및 코드 정리) ---

// 초기 참여자 더미 데이터 생성
const createInitialPerson = (): Person => ({
  userId: v4(),
  userName: "참여자1",
  upFrontPayment: 0
});

// 초기 장소 더미 데이터 생성
const createInitialHistory = (): UseHistory => ({
  placeId: v4(),
  placeName: "1차 장소",
  placeTotalPrice: 0,
  placePrevTotalPrice: 0,
  placeExcludeUser: [],
  isDetailMode: false,
  placeDetails: []
});

// DB 데이터를 앱 인터페이스 규격에 맞게 정규화
const normalizeHistory = (rawHistory : UseHistory[]) => {
  return rawHistory.map(h => {
    // 현재 세부 항목의 총합 계산
    const detailsSum = (h.placeDetails || []).reduce(
      (sum, d) => sum + (Number(d.placeItemPrice) || 0),
      0
    );

    // 상세 모드 상태에 따른 PrevTotalPrice 결정
    // 이미 상세 모드라면 현재 세부항목 합계를, 아니면 기존에 저장된 백업값을 사용
    const initialPrevPrice = h.isDetailMode
      ? (detailsSum || Number(h.placeTotalPrice) || 0)
      : (Number(h.placePrevTotalPrice) || 0);

    return {
      placeId: h.placeId || v4(),
      placeName: h.placeName || "",
      placeTotalPrice: Number(h.placeTotalPrice) || 0,
      placeExcludeUser: h.placeExcludeUser || [],
      isDetailMode: h.isDetailMode || false,
      placePrevTotalPrice: initialPrevPrice, // 백업 금액 동기화
      placeDetails: (h.placeDetails || []).map((d) => ({
        placeItemId: d.placeItemId || v4(),
        placeItemName: d.placeItemName || "",
        placeItemPrice: Number(d.placeItemPrice) || 0,
        placeItemExcludeUser: d.placeItemExcludeUser || []
      }))
    };
  });
};

const findDocByCode = async (code: string) => {
  const q = query(collection(db, COLLECTION_NAME), where("meetEntryCode", "==", code));
  const querySnap = await getDocs(q);
  if (querySnap.empty) return null;
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

      // people 데이터가 비어있으면 더미 데이터 사용
      const cleanPeople = (data.people && data.people.length > 0)
        ? data.people
        : [createInitialPerson()];

      // history 데이터가 비어있으면 더미 데이터 사용
      const rawHistory = (data.history && data.history.length > 0)
        ? data.history
        : [createInitialHistory()];

      // DB 필드명과 인터페이스 필드명 동기화 및 상세 모드 초기값 설정
      const cleanHistory = normalizeHistory(rawHistory);

      set({
        meetTitle: data.meetTitle || "정보를 불러오는 중...",
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

      const initialPeople = [createInitialPerson()];
      const initialHistory = [createInitialHistory()];

      await setDoc(docRef, {
        meetTitle: formData.meetTitle,
        meetEntryCode: formData.meetEntryCode,
        meetEditCode: formData.meetEditCode,
        // 빈 배열 대신 더미 데이터가 포함된 배열로 저장
        people: initialPeople,
        history: initialHistory,
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

        // people 데이터가 비어있으면 더미 데이터 사용
        const cleanPeople = (data.people && data.people.length > 0)
          ? data.people
          : [createInitialPerson()];

        // history 데이터가 비어있으면 더미 데이터 사용
        const rawHistory = (data.history && data.history.length > 0)
          ? data.history
          : [createInitialHistory()];

        // 중복되었던 변환 로직을 normalizeHistory 함수로 대체
        const cleanHistory = normalizeHistory(rawHistory);

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

    // 이름이 없는 참여자 제외
    const filterPeople = people.filter(p => p.userName.trim() !== "");

    // 장소 이름이 있고, 그 안의 세부 항목도 이름이 있는 것만 필터링
    const filterHistory = useHistory
      .filter(h => h.placeName.trim() !== "")
      .map(h => {
        // 먼저 세부 항목을 필터링합니다.
        const cleanedDetails = h.placeDetails.filter(d => d.placeItemName.trim() !== "");

        return {
          ...h,
          placeDetails: cleanedDetails,
          // 필터링된 항목이 있으면 기존 모드 유지, 없으면 강제로 false
          isDetailMode: cleanedDetails.length > 0 ? h.isDetailMode : false
        };
      });

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
            people: structuredClone(filterPeople), // JSON parse/stringify 대신 최신 표준인 structuredClone 사용 제안
            history: structuredClone(filterHistory)
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
      // 해당 장소 제외 인원
      const placeExcludes = place.placeExcludeUser || [];
      // 해당 장소에 참여한 사람들 (장소 제외자 필터링)
      const placeParticipants = activePeople.filter(p => !placeExcludes.includes(p.userId));

      if (placeParticipants.length === 0) return;

      // 상세 모드일 때와 일반 모드일 때를 나누어 정산합니다.
      if (place.isDetailMode) {
        let totalDetailsPrice = 0;

        // 세부 항목별 정산 (고기, 술 등 특정 인원만 먹은 것)
        (place.placeDetails || []).forEach(item => {
          // 해당 장소 세부 항목 제외 인원
          const itemExcludes = item.placeItemExcludeUser || [];
          // 항목 참여자 = 장소 참여자 중 항목 제외자 뺀 사람
          const itemParticipants = placeParticipants.filter(p => !itemExcludes.includes(p.userId));

          if (itemParticipants.length > 0) {
            const price = Number(item.placeItemPrice) || 0;
            totalDetailsPrice += price;
            const divided = price / itemParticipants.length;

            itemParticipants.forEach(p => {
              balances[p.userId] = (balances[p.userId] || 0) + divided;
            });
          }
        });

        // 미분류 잔액 정산 (장소 전체 금액 - 세부 항목 합계)
        // 예: 10만원 결제했는데 세부내역은 8만원만 적었다면, 남은 2만원은 해당 장소 참여자 전원이 1/n
        const remaining = (Number(place.placeTotalPrice) || 0) - totalDetailsPrice;

        // 팩트 체크: 잔액이 0보다 클 때만 정산 (세부 항목 합계가 전체 금액을 초과하는 경우 방지)
        if (remaining > 0) {
          // 남은 금액은 장소 참여자(placeParticipants) 전원이 n분의 1
          const dividedRemaining = remaining / placeParticipants.length;
          placeParticipants.forEach(p => {
            balances[p.userId] = (balances[p.userId] || 0) + dividedRemaining;
          });
        }
      } else {
        // 일반 모드: 장소 전체 금액을 장소 참여자(placeParticipants) 전원이 n분의 1
        const totalPlacePrice = Number(place.placeTotalPrice) || 0;
        const divided = totalPlacePrice / placeParticipants.length;

        placeParticipants.forEach(p => {
          balances[p.userId] = (balances[p.userId] || 0) + divided;
        });
      }
    });

    return balances;
  }
}));