import { TranslationProvider } from "@rbx/core-scripts/react";
import HomepageReminderDialog from "./components/HomepageReminderDialog";

function App(): JSX.Element {
  return (
    <TranslationProvider config={["Feature.Home", "CommonUI.Controls"]}>
      <HomepageReminderDialog />
    </TranslationProvider>
  );
}

export default App;
