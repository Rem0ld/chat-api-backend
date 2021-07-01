import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      username: 'Alice',
      password_hash: ";asldkfjasldkfj",
      channel: {
        create: {
          name: "salon de the"
        }
      }
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      username: 'Bob',
      password_hash: "d;lkfoqig",
      channel: {
        create: {
          name: "salon de jeux"
        }
      },
    },
  })

  const userInChannel = await prisma.userInChannel.createMany({
    data: [{
      userId: 1,
      channelId: 1
    }, {
      userId: 2,
      channelId: 1
    }, {
      userId: 2,
      channelId: 2
    }]
  });
  const messages = await prisma.message.createMany({
    data: [
      {
        content: "je suis bo",
        channelId: 2,
        authorId: 2
      },
      {
        content: "hola",
        channelId: 1,
        authorId: 2
      },
      {
        content: "j'aime le the",
        channelId: 1,
        authorId: 1
      }
    ]
  })
  console.log({ alice, bob })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })