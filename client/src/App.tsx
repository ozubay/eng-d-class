import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import StagePage from "./pages/StagePage";
import FlashcardPage from "./pages/FlashcardPage";
import MatchingPage from "./pages/MatchingPage";
import QuizPage from "./pages/QuizPage";
import WrongNotePage from "./pages/WrongNotePage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/stage/:stageId"} component={StagePage} />
      <Route path={"/stage/:stageId/flashcard"} component={FlashcardPage} />
      <Route path={"/stage/:stageId/match"} component={MatchingPage} />
      <Route path={"/stage/:stageId/quiz"} component={QuizPage} />
      <Route path={"/wrong-note"} component={WrongNotePage} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
