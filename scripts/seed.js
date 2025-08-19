// Instead of ES style:
// import { PrismaClient } from "@prisma/client";

import {PrismaClient} from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "mike",
      email: "mike@example.com",
    },
  });

  console.log(user);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
