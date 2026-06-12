import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/hash'

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@biopaternal.local'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`)
    return
  }

  const passwordHash = await hashPassword(adminPassword)
  await prisma.user.create({
    data: {
      email: adminEmail,
      password: passwordHash,
      role: 'ADMIN',
      Consents: {
        create: {
          cguAccepted: true,
          privacyAccepted: true,
          version: '1.0.0',
          acceptedAt: new Date(),
        },
      },
    },
  })

  console.log(`Created admin user: ${adminEmail}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
