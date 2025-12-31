// 공통적으로 사용되는 제약 조건
const LIMITS = {

  /** 10 */
  NAME: 10,

  /** 15 */
  CODE: 15,
};

// 입력란 관련 메시지 (Placeholders)
export const PLACEHOLDERS = {
  /** 모임 제목을 입력하세요.*/
  MEET_NAME: "모임 제목을 입력하세요.",

  /** 입장 코드를 입력하세요.*/
  ENTER_CODE: "입장 코드를 입력하세요.",

  /** 입장 시 필요한 코드입니다.*/
  NEED_IN: "입장 시 필요한 코드입니다.",

  /** 내역 수정 시 필요합니다.*/
  NEED_EDIT: "내역 수정 시 필요합니다.",

  /** 수정 코드를 입력해주세요*/
  EDIT_CODE: "수정 코드를 입력해주세요",


  // 에러 발생 시 교체용

   /** 모임 제목이 비었습니다.*/
  EMPTY_NAME: "모임 제목이 비었습니다.",

   /** 코드가 비었습니다.*/
  EMPTY_CODE: "코드가 비었습니다.",

};

// 에러 알림 메시지 (Errors)
export const ERRORS = {

  /** 이미 사용 중인 이름입니다. */
  DUPLICATED_NAME: "이미 사용 중인 이름입니다.",

  /** 이미 사용 중인 코드입니다. */
  DUPLICATED_CODE: "이미 사용 중인 코드입니다.",

  /** 존재하지 않는 코드입니다. */
  INVALID_CODE: "존재하지 않는 코드입니다.",

  /** 수정 코드가 틀렸습니다. */
  WRONG_EDIT_CODE: "수정 코드가 틀렸습니다.",

  /** 이름은 ${LIMITS.NAME}자 이내여야 합니다. */
  LIMIT_NAME: `이름은 ${LIMITS.NAME}자 이내여야 합니다.`,

  /** 코드는 ${LIMITS.CODE}자 이내여야 합니다. */
  LIMIT_CODE: `코드는 ${LIMITS.CODE}자 이내여야 합니다.`,

  /** 변경 사항이 없습니다. */
  EXCLUDE_SAME: "변경 사항이 없습니다.",

  /** 전원 제외는 불가능합니다. */
  EXCLUDE_FULL: "전원 제외는 불가능합니다.",

  /** 데이터 저장에 실패했습니다. */
  SAVE_FAILED: "데이터 저장에 실패했습니다.",
};

// 성공 메시지 (Success)
export const SUCCESS = {

  /** 모임이 생성되었습니다. */
  CREATE: "모임이 생성되었습니다.",

  /** 데이터 업데이트 완료! */
  UPDATE: "데이터 업데이트 완료!",
};

// 모드 및 기타
export const MODES = {

  /** 기본 모드 */
  NORMAL: "기본 모드",

  /** 수정 모드 */
  EDIT: "수정 모드",

  /** 수정을 종료하시겠습니까? */
  EDIT_COMPLETE: "수정을 계속하시겠어요?",
};