import { PrismaClient } from '@/app/generated/prisma'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Full webhook payload:', JSON.stringify(evt.data, null, 2))

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data

      try {
        await prisma.user.create({
          data: {
            clerkId: id,
            email: email_addresses[0]?.email_address || '',
            firstName: first_name || null,
            lastName: last_name || null,
          },
        })
        console.log('[WEBHOOK] User created successfully in database')
        return NextResponse.json({ message: 'User created successfully' }, { status: 201 })
      } catch (dbError) {
        console.error('[WEBHOOK] Error creating user in database:', dbError)
        return NextResponse.json({ error: 'Failed to create user in database' }, { status: 500 })
      }
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data

      try {
        await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: email_addresses[0]?.email_address || '',
            firstName: first_name || null,
            lastName: last_name || null,
          },
        })
        console.log('[WEBHOOK] User updated successfully in database')
        return NextResponse.json({ message: 'User updated successfully' }, { status: 200 })
      } catch (dbError) {
        console.error('[WEBHOOK] Error updating user in database:', dbError)
        return NextResponse.json({ error: 'Failed to update user in database' }, { status: 500 })
      }
    }

    if (eventType === 'user.deleted') {
      try {
        await prisma.user.delete({
          where: { clerkId: evt.data.id },
        })
        console.log('[WEBHOOK] User deleted successfully from database')
        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
      } catch (dbError) {
        console.error('[WEBHOOK] Error deleting user from database:', dbError)
        return NextResponse.json({ error: 'Failed to delete user from database' }, { status: 500 })
      }
    }

    console.log('[WEBHOOK] Unhandled event type:', eventType)
    return NextResponse.json({ message: 'Webhook received but not processed' }, { status: 200 })

  } catch (err) {
    console.error('[WEBHOOK] Error verifying webhook:', err)
    return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 })
  } finally {
    await prisma.$disconnect()
  }
}