/* 중복된 이름 or 코드 */

/* 모임 등록 시 에러 */
export const DUPLICATION = {
  name: {
    error: "사용중인 이름 입니다.",
    limit: "모임제목은 10자 이내입니다."
  },
  code: {
    error: "사용중인 코드 입니다.",
    limit: "코드는 15자 이내 입니다."
  },
  edit: {
    error: "수정 코드를 입력해주세요",
    limit: "코드는 15자 이내 입니다."
  },
  success : "생성되었습니다."
};

/* 모임 등록 시 input 표시 */
export const PLACEHOLDERS = {
  name: {
    error : "모임 제목이 비었습니다.",
    normal: "모임 제목을 입력하세요.",
  },
  code: {
    error : "입장 코드를 입력해주세요",
    normal: "입장 시 필요한 코드 입니다.",
  },
  edit: {
    error : "수정 코드를 입력해주세요",
    normal: "내역 수정 시 필요합니다.",
  },
};

export const HOMEINPUT = {
  notice: {
    noExist : "존재하지 않는 코드 입니다."
  },
  placeHolder: {
    normal : "코드를 입력하세요.",
    empty : "코드가 비었습니다.",
  }
}

export const EDITMODAL = {
  placeHolder : {
    normal : "코드를 입력해주세요",
    empty : "코드가 비었습니다."
  },
  notice: {
    noExist : "코드가 틀렸습니다.",
    limit: "코드는 15자 이내 입니다."
  },
}

export const MODE = {
  normal : "기본",
  edit : "수정"
}

export const EXCLUDE = {
  same : "변경 사항이 없습니다.",

}