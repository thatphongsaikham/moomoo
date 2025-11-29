import { menuItems } from "../data/menuData";

function MenuPage() {
  // เอาเฉพาะเมนูปกติ (isSpecial = false)
  const normalMenu = menuItems.filter((item) => !item.isSpecial);

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Menu</h1>
      <ul>
        {normalMenu.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{item.name}</strong> - {item.price}฿
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MenuPage;
