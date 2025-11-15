import { getDb } from "./db";

export async function initDatabase() {
  const db = await getDb();

  // Tạo bảng contacts đúng cấu trúc đề xuất
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      favorite INTEGER DEFAULT 0,
      created_at INTEGER
    );
  `);

  // Chèn dữ liệu mẫu (nếu muốn kiểm tra)
  await db.execAsync(`
    INSERT INTO contacts (name, phone, email, favorite, created_at)
    VALUES
      ('Đặng Công Huynh', '0777476677', 'conghuynh2004@gmail.com', 0, ${Date.now()}),
      ('Tran Thi B', '0988877665', 'b@example.com', 1, ${Date.now()});
  `);

  console.log("Contacts table ready + sample data inserted.");
}
