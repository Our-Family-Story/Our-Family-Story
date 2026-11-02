현이네 가족 스케줄
월간 스케줄(한국 공휴일 표시), 실시간 픽업 현황, 시간축 주간 픽업표(월~토)가 있는 가족 홈페이지입니다.
Cloudflare Pages(무료)로 올리면 가족 누구나 토큰 없이 달력에서 바로 일정을 적을 수 있고, "픽업 완료"도 가족 모두에게 공유됩니다.
파일
`index.html` — 홈페이지. 픽업 시간·메모·가족 정보는 맨 위 **"✏️ 여기만 수정하세요"**에서 고칩니다.
`functions/api/state.js` — 저장 기능. 손대지 않아도 됩니다.
Cloudflare에 올리기 (처음 한 번, 10분)
1. GitHub에 파일 올리기
저장소에 `index.html`, `README.md`, `functions/api/state.js`를 올립니다.
`functions/api/` 폴더 구조를 그대로 유지해야 합니다. 웹에서 올릴 때는 압축을 푼 폴더 안의 내용을 통째로 끌어다 놓으면 폴더가 유지됩니다.
2. 저장 공간(KV) 만들기
Cloudflare 대시보드 → Storage & Databases → Workers KV → Create → 이름 `family-schedule` → 만들기.
3. Pages 프로젝트 만들기
Workers & Pages → Create → Pages 탭 → Connect to Git → GitHub 연결 → 저장소 선택.
Framework preset: `None`
Build command: 비워두기
Build output directory: `/`
Save and Deploy를 누릅니다.
> 화면에 Workers 만들기만 보이면, 아래쪽 "Looking to deploy Pages? Get started"를 누르세요.
4. 저장 공간 연결하기
만든 Pages 프로젝트 → Settings → Bindings → Add → KV namespace
Variable name: `SCHEDULE` (대문자 그대로)
KV namespace: `family-schedule`
5. (권장) 가족 비밀번호 정하기
같은 Settings → Variables and Secrets → Add → 이름 `FAMILY_CODE`, 값은 가족 비밀번호(예: 숫자 4자리), Type은 Secret.
비밀번호를 정하면 주소를 아는 다른 사람이 일정을 고칠 수 없습니다. 가족은 처음 저장할 때 한 번만 입력합니다.
6. 다시 배포하고 열기
Deployments → 맨 위 배포의 `⋯` → Retry deployment.
끝나면 `https://<프로젝트이름>.pages.dev`에서 열립니다. 페이지 맨 아래에 "✓ 저장 서버 연결됨"이 보이면 성공입니다.
이후에는 GitHub에서 `index.html`을 고쳐 Commit하면 Cloudflare가 자동으로 다시 배포합니다.
사용하기
월간 스케줄: 날짜 누르기 → "+ 이 날 일정 추가" 또는 "수정". 저장하면 가족 모두에게 바로 반영됩니다.
픽업 완료: 실시간 픽업 현황에서 누르면 가족 화면에도 표시됩니다. 30초마다 자동으로 새로고침됩니다.
픽업 시간 바꾸기: GitHub에서 `index.html`의 `PICKUPS`를 고칩니다.
```js
{ day: "토", time: "12:30", who: "준현", place: "수영장" },
```
참고
2026·2027년 공휴일·대체공휴일이 들어 있습니다(노동절·제헌절·지방선거일 포함). 2028년 이후는 `HOLIDAYS`에 같은 형식으로 추가하세요.
공휴일에는 픽업이 자동으로 쉽니다. 끄려면 `SKIP_PICKUP_ON_HOLIDAYS = false`.
`index.html`의 `EVENTS`는 처음 시작할 때만 쓰입니다. 그 뒤 일정은 Cloudflare 저장 공간에 저장됩니다.
GitHub Pages 주소로 열면 저장 서버가 없어 보기 전용으로 동작합니다. GitHub Pages는 꺼도 됩니다.
