# Graphic Design English Trainer

그래픽 디자인 영어 학습 웹앱 — 플래시카드 · 매칭 · 퀴즈 · 오답노트.
Manus.ai로 초안을 만든 뒤 Claude Code로 가져와 독립 배포한 버전입니다.

- **스택**: Vite + React 19 + TypeScript + Tailwind 4 + wouter + shadcn/ui
- **백엔드 없음**: 모든 콘텐츠는 클라이언트 번들에 포함, 진도·오답은 브라우저 `localStorage`에 저장
- **콘텐츠**: `client/src/lib/courseData.ts`, 퀴즈 로직 `client/src/lib/quizEngine.ts`

## 개발

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # 정적 산출물 → dist/public
pnpm preview  # 빌드 결과 미리보기
```

주요 파일
- 라우팅: `client/src/App.tsx` (`/`, `/stage/:id`, `.../flashcard|match|quiz`, `/wrong-note`)
- 페이지: `client/src/pages/`
- 진도 훅: `client/src/hooks/useProgress.ts`

## 배포

`main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드 후 GitHub Pages로 자동 배포합니다.
SPA 딥링크는 `404.html`(= index.html 복사본) fallback으로 처리됩니다.
