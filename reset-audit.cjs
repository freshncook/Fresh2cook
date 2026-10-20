const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `);

  for (const item of tables) {
    const name = item.name;
    const count = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) AS total FROM "${name.replace(/"/g, '""')}"`
    );
    console.log(`${name}: ${count[0].total}`);
  }
}

main()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
