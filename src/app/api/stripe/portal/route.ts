import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, getAppUrl } from "@/lib/stripe";
import { UserRepository } from "@/app/common/user/repository/UserRepository";

export async function POST(_request: NextRequest) {
	try {
		const { userId: authId } = await auth();

		if (!authId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userRepository = new UserRepository();
		const user = await userRepository.getByAuthId(authId);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (!user.stripeCustomerId) {
			return NextResponse.json({ error: "No subscription found" }, { status: 400 });
		}

		const appUrl = getAppUrl();

		const session = await stripe.billingPortal.sessions.create({
			customer: user.stripeCustomerId,
			return_url: `${appUrl}/subscription`,
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("Portal error:", error);
		return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
	}
}
