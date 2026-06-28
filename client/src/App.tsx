import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import StagePage from "./pages/StagePage";
import StagesPage from "./pages/StagesPage";
import FlashcardPage from "./pages/FlashcardPage";
import MatchingPage from "./pages/MatchingPage";
import QuizPage from "./pages/QuizPage";
import WrongNotePage from "./pages/WrongNotePage";
import CritiqueNotesPage from "./pages/CritiqueNotesPage";
import AchievementsPage from "./pages/AchievementsPage";

// GitHub Pages 서브경로(또는 커스텀 도메인 루트)에 맞춰 라우터 base를 Vite BASE_URL과 동기화
const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

function AppRoutes() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/stages"} component={StagesPage} />
      <Route path={"/stage/:stageId"} component={StagePage} />
      <Route path={"/stage/:stageId/flashcard"} component={FlashcardPage} />
      <Route path={"/stage/:stageId/match"} component={MatchingPage} />
      <Route path={"/stage/:stageId/quiz"} component={QuizPage} />
      <Route path={"/wrong-note"} component={WrongNotePage} />
      <Route path={"/critique-notes"} component={CritiqueNotesPage} />
      <Route path={"/achievements"} component={AchievementsPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={routerBase}>
            <AppRoutes />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
