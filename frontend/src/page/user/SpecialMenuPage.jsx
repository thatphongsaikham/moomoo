import { menuItems } from "../data/menuData";

function SpecialMenuPage() {
  // เอาเฉพาะเมนูพิเศษ (isSpecial = true)
  const specialMenu = menuItems.filter((item) => item.isSpecial);

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Special Menu</h1>
      <ul>
        {specialMenu.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{item.name}</strong> - {item.price}฿
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpecialMenuPage;
