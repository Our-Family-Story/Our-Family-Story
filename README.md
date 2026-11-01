우리집 픽업 보드
조서현·조세현·조준현 픽업 스케줄을 보는 가족 홈페이지입니다. GitHub Pages로 무료 호스팅합니다.
파일
`index.html` — 페이지 (오늘 픽업, 주간 스케줄, 가족 메모)
`schedule.json` — 스케줄 데이터. 이 파일만 고치면 됩니다.
GitHub Pages로 올리기
github.com에서 새 저장소를 만듭니다 (예: `family-home`, Public).
Add file → Upload files로 `index.html`, `schedule.json`, `README.md`를 올리고 Commit.
저장소 Settings → Pages에서 Source를 `Deploy from a branch`, Branch를 `main` / `(root)`로 저장.
1~2분 뒤 `https://<아이디>.github.io/family-home/` 주소로 열립니다.
스케줄 고치기
GitHub에서 `schedule.json`을 열고 연필 아이콘(Edit)을 눌러 수정 후 Commit하면 1분 안에 반영됩니다.
```json
{ "day": "월", "time": "13:50", "kid": "조준현", "place": "초등학교 정문", "note": "" }
```
`day`: 월 화 수 목 금
`time`: 24시간 형식 (예: 21:00)
항목 사이 쉼표, 큰따옴표를 빠뜨리지 마세요.
참고
"픽업 완료" 표시는 각자 휴대폰(브라우저)에만 저장됩니다.
Public 저장소는 누구나 볼 수 있습니다. 학교 이름 등 민감한 정보는 넣지 않는 걸 권합니다.
