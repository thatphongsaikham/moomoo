import MenuPage from "./pages/MenuPage";
import SpecialMenuPage from "./pages/SpecialMenuPage";

function App() {
  return (
    <div style={{ padding: "1.5rem" }}>
      {/* เมนูปกติ */}
      <MenuPage />

      <hr style={{ margin: "2rem 0" }} />

      {/* เมนูพิเศษ */}
      <SpecialMenuPage />
    </div>
  );
}

export default App;
