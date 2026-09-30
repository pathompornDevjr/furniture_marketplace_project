import { PrismaClient } from "./src/generated/prisma";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing zero dates in MySQL if any...");
  try {
    await prisma.$executeRawUnsafe(`UPDATE tb_role SET createdAt = NOW() WHERE CAST(createdAt AS CHAR) LIKE '0000-00-00%'`);
  } catch (err) {
    console.log("tb_role createdAt fix note:", err.message);
  }
  try {
    await prisma.$executeRawUnsafe(`UPDATE tb_role SET updatedAt = NOW() WHERE CAST(updatedAt AS CHAR) LIKE '0000-00-00%'`);
  } catch (err) {
    console.log("tb_role updatedAt fix note:", err.message);
  }
  try {
    await prisma.$executeRawUnsafe(`UPDATE tb_user SET createdAt = NOW() WHERE CAST(createdAt AS CHAR) LIKE '0000-00-00%'`);
  } catch (err) {
    console.log("tb_user createdAt fix note:", err.message);
  }
  try {
    await prisma.$executeRawUnsafe(`UPDATE tb_user SET updatedAt = NOW() WHERE CAST(updatedAt AS CHAR) LIKE '0000-00-00%'`);
  } catch (err) {
    console.log("tb_user updatedAt fix note:", err.message);
  }

  console.log("Querying roles using raw query...");
  const roles = await prisma.$queryRawUnsafe(`SELECT role_id, role_name FROM tb_role`);
  console.log("Found roles:", roles);

  let adminRoleId = 1;
  const adminRole = roles.find((r) => r.role_id === 1 || String(r.role_name).toLowerCase().includes("admin"));
  if (adminRole) {
    adminRoleId = adminRole.role_id;
  } else if (roles.length > 0) {
    adminRoleId = roles[0].role_id;
  }

  console.log("Target admin role_id:", adminRoleId);

  const salt = await bcryptjs.genSalt(12);
  const hashedPassword = await bcryptjs.hash("admin123", salt);

  const existingUsers = await prisma.$queryRawUnsafe(
    `SELECT user_id, user_name, roleId FROM tb_user WHERE user_name = 'admin'`
  );

  if (existingUsers && existingUsers.length > 0) {
    console.log("Admin user exists. Updating password and role...");
    await prisma.$executeRawUnsafe(
      `UPDATE tb_user SET password = ?, roleId = ?, allowed = 1, updatedAt = NOW() WHERE user_name = 'admin'`,
      hashedPassword,
      adminRoleId
    );
    console.log("Admin user updated successfully with hashed password!");
  } else {
    console.log("Inserting new admin user...");
    await prisma.$executeRawUnsafe(
      `INSERT INTO tb_user (user_name, password, first_name, last_name, title_type, gender, email, tel, ctn_status, allowed, roleId, createdAt, updatedAt)
       VALUES ('admin', ?, 'Admin', 'System', 'นาย', 'ชาย', 'admin@furniture.local', '0812345678', 'active', 1, ?, NOW(), NOW())`,
      hashedPassword,
      adminRoleId
    );
    console.log("Admin user created successfully with hashed password!");
  }

  // Verify the admin user
  const verified = await prisma.$queryRawUnsafe(
    `SELECT user_id, user_name, password, roleId, allowed FROM tb_user WHERE user_name = 'admin'`
  );
  console.log("Verified Admin record in DB:", {
    user_id: verified[0]?.user_id,
    user_name: verified[0]?.user_name,
    roleId: verified[0]?.roleId,
    allowed: verified[0]?.allowed,
    hashSample: verified[0]?.password?.substring(0, 15) + "...",
  });

  // Verify bcryptjs comparison
  const isMatch = await bcryptjs.compare("admin123", verified[0]?.password);
  console.log("Password verification (bcryptjs.compare('admin123')): ", isMatch);
}

main()
  .catch((e) => {
    console.error("Error executing script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
