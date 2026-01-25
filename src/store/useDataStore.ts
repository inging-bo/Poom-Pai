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
  isLoading: boolean; // 로딩 상태
  selectedUserId: string | null; // 클릭된 사용자 ID

  // Actions
  toggleEditMode: (value: boolean) => void;
  enterMeet: (code: string) => Promise<boolean>;
  createMeet: (formData: MeetFormData) => Promise<{ success: boolean; message: string }>;
  updatePeople: (newPeople: Person[]) => void;
  updateHistory: (newHistory: UseHistory[]) => void;
  fetchData: () => Promise<void>;
  saveAllData: () => Promise<void>;
  cancelEdit: () => void;
  resetAllData: () => void;
  setSelectedUserId: (id: string | null) => void;

  // Selectors
  getTotals: () => { totalMoney: number; totalUse: number; haveMoney: number };
  getBalances: () => Record<string, number>;
  getUserExpenseDetails: (userId: string) => UserExpenseDetail[]; // 특정 사용자의 상세 지출 내역 계산

  // local
  isLocal: boolean;
  startLocalMeet: (meetTitle: string) => void; // 로컬 모드 시작 함수
}

export interface UserExpenseDetail {
  placeName: string;
  itemName: string; // '장소 전체' 또는 '세부 항목명'
  amount: number;
}

// --- 내부 헬퍼 함수 ---

// 초기 참여자 더미 데이터 생성
export const createInitialPerson = (): Person => ({
  userId: v4(),
  userName: "",
  upFrontPayment: 0
});

// 초기 장소 더미 데이터 생성
export const createInitialHistory = (): UseHistory => ({
  placeId: v4(),
  placeName: "",
  placeTotalPrice: 0,
  placeExcludeUser: [],
  placeDetails: []
});

// 초기 세부 항목 더미 데이터 생성
export const createInitialDetail = (): UseHistoryDetails => ({
  placeItemId: v4(),
  placeItemName: "",
  placeItemPrice: 0,
  placeItemExcludeUser: []
});

// DB 데이터를 앱 인터페이스 규격에 맞게 정규화
const normalizeHistory = (rawHistory: UseHistory[]): UseHistory[] =>
  rawHistory.map(h => ({
    placeId: h.placeId || v4(),
    placeName: h.placeName || "",
    placeTotalPrice: Number(h.placeTotalPrice) || 0,
    placeExcludeUser: h.placeExcludeUser || [],
    placeDetails: (h.placeDetails || []).map(d => ({
      placeItemId: d.placeItemId || v4(),
      placeItemName: d.placeItemName || "",
      placeItemPrice: Number(d.placeItemPrice) || 0,
      placeItemExcludeUser: d.placeItemExcludeUser || []
    }))
  }));

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
  isLoading: false,
  selectedUserId: null,
  // local
  isLocal: false,
  // 로컬 모드 시작 로직
  startLocalMeet: (meetTitle) => {
    const initialPeople = [createInitialPerson()];
    const initialHistory = [createInitialHistory()];

    set({
      meetTitle: meetTitle,
      people: initialPeople,
      useHistory: initialHistory,
      isLocal: true, // 로컬 모드 활성화
      currentMeetCode: null, // 서버 코드 없음
      isEdit: true, // 바로 편집 가능한 상태로 진입
      dbData: { people: [], history: [] } // 로컬이므로 원본 데이터는 비어있음
    });
  },
  setSelectedUserId: (id) => set({ selectedUserId: id }),

  // 특정 사용자의 상세 지출 내역 계산 셀렉터
  getUserExpenseDetails: (userId: string) => {
    const { useHistory, people } = get();
    const details: UserExpenseDetail[] = [];
    const targetPerson = people.find(p => p.userId === userId);

    if (!targetPerson || targetPerson.userName.trim() === "") return [];

    useHistory.forEach(place => {
      const placeExcludes = place.placeExcludeUser || [];
      // 장소 전체에서 제외된 사람이면 패스
      if (placeExcludes.includes(userId)) return;

      const activePeopleInPlace = people.filter(p =>
        p.userName.trim() !== "" && !placeExcludes.includes(p.userId)
      );

      // 상세내역이 있는 경우로 로직 분기
      if (place.placeDetails && place.placeDetails.length > 0) {
        let totalDetailsPrice = 0;

        // 1. 세부 항목별 체크
        (place.placeDetails || []).forEach(item => {
          const itemExcludes = item.placeItemExcludeUser || [];
          if (!itemExcludes.includes(userId)) {
            const itemParticipants = activePeopleInPlace.filter(p => !itemExcludes.includes(p.userId));
            if (itemParticipants.length > 0) {
              const price = Number(item.placeItemPrice) || 0;
              const divided = price / itemParticipants.length;
              totalDetailsPrice += price;

              details.push({
                placeName: place.placeName,
                itemName: item.placeItemName || "세부 항목",
                amount: divided
              });
            }
          } else {
            // 본인이 제외되었더라도 합산에는 포함 (미분류 잔액 계산용)
            totalDetailsPrice += (Number(item.placeItemPrice) || 0);
          }
        });

        // 2. 미분류 잔액 정산
        const remaining = (Number(place.placeTotalPrice) || 0) - totalDetailsPrice;
        if (remaining > 0) {
          const dividedRemaining = remaining / activePeopleInPlace.length;
          details.push({
            placeName: place.placeName,
            itemName: "공통(미분류) 잔액",
            amount: dividedRemaining
          });
        }
      } else {
        // 일반 모드: 장소 전체 N분의 1
        const totalPlacePrice = Number(place.placeTotalPrice) || 0;
        const divided = totalPlacePrice / activePeopleInPlace.length;

        details.push({
          placeName: place.placeName,
          itemName: "장소 전체",
          amount: divided
        });
      }
    });

    return details;
  },

  toggleEditMode: (value) => set({ isEdit: value }),

  // 내용 초기화
  resetAllData: () => set({
    currentMeetCode: null,
    meetTitle: "",
    people: [],
    useHistory: [],
    meetEditCode: "",
    dbData: { people: [], history: [] },
    isEdit: false,
    isLoading: false
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
    set({ isLoading: true, isLocal: false }); // 로딩 시작
    try {
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
    } finally {
      set({ isLoading: false }); // 로딩 종료
    }
  },

  /* 새로운 모임 등록 */
  createMeet: async (formData) => {
    set({ isLoading: true }); // 로딩 시작
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
    } finally {
      set({ isLoading: false }); // 로딩 종료
    }
  },

  updatePeople: (newPeople) => set({ people: newPeople }),
  updateHistory: (newHistory) => set({ useHistory: newHistory }),

  /* 새로고침 */
  fetchData: async () => {
    const { currentMeetCode, isLocal } = get();
    // 로컬 모드이거나 코드가 없으면 서버 요청 차단
    if (isLocal || !currentMeetCode) return;

    set({ isLoading: true });
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
    } finally {
      set({ isLoading: false }); // 로딩 종료
    }
  },

  /* 저장 */
  saveAllData: async () => {
    const { isLocal, people, useHistory, currentMeetCode } = get();

    if (isLocal || !currentMeetCode) {
      console.log("로컬 모드: 서버 저장을 건너뜁니다.");
      // 로컬에서는 현재 UI의 데이터를 dbData에만 동기화해서 '취소' 기능 등이 작동하게 함
      set({
        isEdit: false,
        dbData: {
          people: structuredClone(people),
          history: structuredClone(useHistory)
        }
      });
      return;
    }

    set({ isLoading: true }); // 로딩 시작
    // 이름이 없는 참여자 제외
    const filterPeople = people.filter(p => p.userName.trim() !== "");

    // 유효한 참여자의 ID 목록 추출 (제외 내역 정리에 사용)
    const validUserIds = filterPeople.map(p => p.userId);

    // 장소 이름이 있고, 그 안의 세부 항목도 이름이 있는 것만 필터링
    const filterHistory = useHistory
      .filter(h => h.placeName.trim() !== "")
      .map(h => {
        // 사라진 참여자가 장소 제외 인원에 포함되어 있으면 제거
        const cleanedPlaceExcludes = (h.placeExcludeUser || []).filter(id => validUserIds.includes(id));

        // 세부 항목 필터링 (이름 없는 항목 제거 + 사라진 참여자 제외 내역 제거)
        const cleanedDetails = h.placeDetails
          .filter(d => d.placeItemName.trim() !== "")
          .map(d => {
            const cleanedItemExcludes = (d.placeItemExcludeUser || []).filter(id => validUserIds.includes(id));
            return {
              ...d,
              placeItemExcludeUser: cleanedItemExcludes
            };
          });

        return {
          ...h,
          placeExcludeUser: cleanedPlaceExcludes,
          placeDetails: cleanedDetails
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
            people: structuredClone(filterPeople),
            history: structuredClone(filterHistory)
          }
        });
      }
    } catch (error) {
      console.error("데이터 저장 실패:", error);
      throw error;
    } finally {
      set({ isLoading: false }); // 로딩 종료
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

      // 상세내역이 있는 경우로 로직 분기
      if (place.placeDetails && place.placeDetails.length > 0) {
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