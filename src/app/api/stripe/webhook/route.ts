import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { db } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = headers().get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        if (customer.deleted) {
          console.log("Customer was deleted")
          break
        }

        const user = await db.user.findFirst({
          where: { email: customer.email! },
        })

        if (user) {
          const existingSub = await db.subscription.findFirst({
            where: { userId: user.id },
          })

          if (existingSub) {
            await db.subscription.update({
              where: { id: existingSub.id },
              data: {
                stripeSubId: subscription.id,
                status: subscription.status,
                plan: subscription.items.data[0]?.price.nickname || "unknown",
              },
            })
          } else {
            await db.subscription.create({
              data: {
                userId: user.id,
                stripeSubId: subscription.id,
                status: subscription.status,
                plan: subscription.items.data[0]?.price.nickname || "unknown",
              },
            })
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await db.subscription.updateMany({
          where: { stripeSubId: subscription.id },
          data: { status: "canceled" },
        })
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}