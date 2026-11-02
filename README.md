현이네 가족 스케줄
서현·세현·준현과 가족 일정을 한 달력에서 보는 홈페이지입니다. 픽업 일정은 노란색으로 따로 표시되고, 아래에 주간 픽업표가 있습니다. GitHub Pages로 무료 호스팅합니다.
파일
`index.html` — 페이지 (오늘 일정, 월간 달력, 주간 픽업표, 가족 메모)
`schedule.json` — 일정 데이터. 이 파일만 고치면 됩니다.
GitHub Pages로 올리기
새 저장소를 만듭니다 (예: `family-home`).
Add file → Upload files로 `index.html`, `schedule.json`, `README.md`를 올리고 Commit.
Settings → Pages에서 Source `Deploy from a branch`, Branch `main` / `(root)` 저장.
1~2분 뒤 `https://<소유주>.github.io/family-home/`에서 열립니다.
schedule.json 고치는 법
GitHub에서 `schedule.json`을 열고 연필 아이콘(Edit) → 수정 → Commit changes.
매주 반복 일정 (`weekly`)
```json
{ "day": "월", "time": "13:50", "who": "조준현", "title": "하교 픽업", "place": "초등학교 정문", "pickup": true }
```
`day`: 일 월 화 수 목 금 토
`pickup: true`를 넣으면 노란색 픽업 일정으로 표시되고 주간 픽업표에도 나옵니다.
학기 중에만 반복하려면 `"from": "2026-09-01", "to": "2026-12-31"`을 추가하세요.
특정 날짜 일정 (`events`)
```json
{ "date": "2026-11-12", "time": "15:30", "who": "조준현", "title": "체험학습", "place": "" }
```
`time`을 빼면 "종일"로 표시됩니다.
`who`는 `조서현`, `조세현`, `조준현`, `가족` 중 하나.
반복 일정을 쉬는 날 (`skip`)
방학식, 재량휴업일처럼 반복 일정이 없는 날:
```json
"skip": ["2026-11-19", "2026-12-25"]
```
주의
항목 사이 쉼표(,)와 큰따옴표("")를 빠뜨리면 페이지가 열리지 않습니다. 마지막 항목 뒤에는 쉼표를 넣지 않습니다.
Public 저장소는 누구나 볼 수 있습니다. 학교 이름처럼 아이 위치를 알 수 있는 정보는 넣지 않는 걸 권합니다.
