import { SHARED_PACKAGE_NAME } from "@finance/shared";

export function App() {
  return (
    <main>
      <h1>Personal Finance</h1>
      <p data-testid="shared-package">{SHARED_PACKAGE_NAME}</p>
    </main>
  );
}
