"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMembers(query: string = "") {
    const members = await prisma.member.findMany({
        where: {
            OR: [
                { fullName: { contains: query } },
                { email: { contains: query } },
            ],
        },
        include: {
            subscriptions: {
                orderBy: { endDate: 'desc' },
                take: 1
            }
        },
        orderBy: { createdAt: "desc" },
    });

    // Dynamic Status Calculation
    return members.map((member: any) => {
        const latestSub = member.subscriptions[0];
        let computedStatus = member.status;

        if (latestSub) {
            const now = new Date();
            const endDate = new Date(latestSub.endDate);
            if (endDate < now) {
                computedStatus = "INACTIVE"; // Expired
            } else {
                computedStatus = "ACTIVE";
            }
        }

        return { ...member, status: computedStatus };
    });
}

export async function createMember(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const imageUrl = formData.get("imageUrl") as string;

    // Subscription Data
    const plan = formData.get("plan") as string;
    const price = parseFloat(formData.get("price") as string);
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    if (!fullName || !phone) {
        throw new Error("Missing required fields");
    }

    // Transaction: Create Member AND Subscription
    await prisma.$transaction(async (tx) => {
        const member = await tx.member.create({
            data: {
                fullName,
                email: email || null,
                phone,
                imageUrl: imageUrl || null,
                status: "ACTIVE", // Initially active upon payment
            },
        });

        if (plan) {
            await tx.subscription.create({
                data: {
                    plan,
                    price,
                    startDate,
                    endDate,
                    memberId: member.id
                }
            });
        }
    });

    revalidatePath("/");
    revalidatePath("/members");
}

export async function deleteMember(id: string) {
    // Cascade delete is usually handled by DB, but here we might need to delete subs first if not configured
    // Prisma usually handles cascade if relation is set up right, but safe to delete manually in transaction
    await prisma.$transaction(async (tx) => {
        await tx.subscription.deleteMany({ where: { memberId: id } });
        await tx.member.delete({ where: { id } });
    });

    revalidatePath("/");
    revalidatePath("/members");
}

export async function updateMember(id: string, formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!fullName || !phone) {
        throw new Error("Missing required fields");
    }

    await prisma.member.update({
        where: { id },
        data: {
            fullName,
            email: email || null,
            phone,
            imageUrl: imageUrl || undefined, // Only update if provided
        },
    });

    revalidatePath("/");
    revalidatePath("/members");
}

export async function renewSubscription(memberId: string, formData: FormData) {
    const plan = formData.get("plan") as string;
    const price = parseFloat(formData.get("price") as string);
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);

    await prisma.$transaction(async (tx) => {
        // Create new subscription
        await tx.subscription.create({
            data: {
                plan,
                price,
                startDate,
                endDate,
                memberId: memberId
            }
        });

        // Update member status to ACTIVE
        await tx.member.update({
            where: { id: memberId },
            data: { status: "ACTIVE" }
        });
    });

    revalidatePath("/");
    revalidatePath("/members");
}

export async function scanMember(id: string) {
    const member = await prisma.member.findUnique({
        where: { id },
        include: {
            subscriptions: {
                orderBy: { endDate: 'desc' },
                take: 1
            }
        }
    });

    if (!member) {
        return { success: false, message: "A'zo topilmadi!" };
    }

    // Check status logic
    let isAllowed = member.status === "ACTIVE";
    let message = "Kirish Ruxsat Etildi";

    // Double check subscription expiration just in case status wasn't auto-updated
    if (member.subscriptions.length > 0) {
        const sub = member.subscriptions[0];
        if (new Date(sub.endDate) < new Date()) {
            isAllowed = false;
            message = "Obuna muddati tugagan!";
        }
    }

    if (!isAllowed) {
        return { success: false, message: "Kirish Taqiqlanadi: " + message, member };
    }

    // CREATE ATTENDANCE RECORD
    await prisma.attendance.create({
        data: {
            memberId: member.id,
            checkIn: new Date()
        }
    });

    return { success: true, message: "Xush kelibsiz!", member };
}

// --- PLAN ACTIONS ---

export async function getPlans() {
    return await prisma.plan.findMany({
        orderBy: { price: 'asc' }
    });
}

export async function createPlan(formData: FormData) {
    const name = formData.get("name") as string;
    const price = parseInt(formData.get("price") as string);
    const duration = parseInt(formData.get("duration") as string);
    const features = formData.get("features") as string;

    if (!name || isNaN(price) || isNaN(duration)) {
        throw new Error("Invalid fields");
    }

    await prisma.plan.create({
        data: {
            name,
            price,
            duration,
            features
        }
    });

    revalidatePath("/subscriptions");
}

export async function deletePlan(id: string) {
    await prisma.plan.delete({ where: { id } });
    revalidatePath("/subscriptions");
}

// --- ATTENDANCE ACTIONS ---

export async function getAttendance(date?: Date) {
    // Default to today (start of day to end of day)
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return await prisma.attendance.findMany({
        where: {
            checkIn: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: {
            member: true
        },
        orderBy: {
            checkIn: 'desc'
        }
    });
}
