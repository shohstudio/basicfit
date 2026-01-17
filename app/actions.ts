"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { sendWebhook } from "./lib/webhook";

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
    try {
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
            return { success: false, message: "Ism va Telefon raqami majburiy!" };
        }

        // Check for duplicate phone
        const existingMember = await prisma.member.findFirst({
            where: { phone }
        });

        if (existingMember) {
            return {
                success: false,
                message: `Bu raqam bilan ${existingMember.fullName} ro'yxatdan o'tgan.`
            };
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

        // Webhook: New Member
        await sendWebhook("MEMBER_CREATED", {
            fullName,
            phone,
            plan: plan || "Obunasiz",
            price: price || 0
        });

        revalidatePath("/");
        revalidatePath("/members");
        return { success: true, message: "Muvaffaqiyatli qo'shildi!" };
    } catch (error: any) {
        console.error("CREATE MEMBER ERROR:", error);
        return { success: false, message: error.message || "Tizim xatoligi yuz berdi" };
    }
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
    try {
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const imageUrl = formData.get("imageUrl") as string;

        if (!fullName || !phone) {
            return { success: false, message: "Ism va Telefon raqami majburiy!" };
        }

        const plan = formData.get("plan") as string;

        // Check duplicate phone (excluding current member)
        const duplicatePhone = await prisma.member.findFirst({
            where: {
                phone,
                id: { not: id }
            }
        });

        if (duplicatePhone) {
            return {
                success: false,
                message: `Bu raqam bilan ${duplicatePhone.fullName} ro'yxatdan o'tgan.`
            };
        }

        await prisma.$transaction(async (tx) => {
            await tx.member.update({
                where: { id },
                data: {
                    fullName,
                    email: email || null,
                    phone,
                    imageUrl: imageUrl || undefined, // Only update if provided
                },
            });

            // Update latest subscription if plan is provided
            if (plan) {
                const latestSub = await tx.subscription.findFirst({
                    where: { memberId: id },
                    orderBy: { endDate: 'desc' }
                });

                if (latestSub) {
                    await tx.subscription.update({
                        where: { id: latestSub.id },
                        data: { plan }
                    });
                }
            }
        });

        revalidatePath("/");
        revalidatePath("/members");
        return { success: true, message: "Tahrirlandi!" };
    } catch (error: any) {
        console.error("UPDATE MEMBER ERROR:", error);
        return { success: false, message: error.message || "Xatolik yuz berdi" };
    }
}

export async function renewSubscription(memberId: string, formData: FormData) {
    try {
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

        // Fetch member name for webhook
        const member = await prisma.member.findUnique({ where: { id: memberId } });

        // Webhook: Subscription Renewed
        await sendWebhook("SUBSCRIPTION_RENEWED", {
            memberId,
            memberName: member?.fullName || "Unknown",
            plan,
            price,
            startDate,
            endDate
        });

        revalidatePath("/");
        revalidatePath("/members");
        return { success: true, message: "Obuna yangilandi!" };
    } catch (error: any) {
        console.error("RENEW ERROR:", error);
        return { success: false, message: error.message || "Xatolik yuz berdi" };
    }
}

export async function scanMember(idInput: string) {
    // Determine if input is a full UUID or a short ID prefix
    // Actually, searching by prefix works for both cases if the prefix is unique enough (8 chars of UUID is extremely unique)

    // Sanitize input (remove whitespace)
    const queryId = idInput.trim();

    const member = await prisma.member.findFirst({
        where: {
            OR: [
                { id: queryId }, // Exact match
                { id: { startsWith: queryId } } // Prefix match
            ]
        },
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

    // Check KUN_ORA (Every other day) Restriction
    if (member.subscriptions.length > 0) {
        const sub = member.subscriptions[0];

        // Expiration Check
        if (new Date(sub.endDate) < new Date()) {
            isAllowed = false;
            message = "Obuna muddati tugagan!";
        } else if (sub.plan === "KUN_ORA") {
            // Check formatted yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
            const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

            const visitedYesterday = await prisma.attendance.findFirst({
                where: {
                    memberId: member.id,
                    checkIn: {
                        gte: startOfYesterday,
                        lte: endOfYesterday
                    }
                }
            });

            if (visitedYesterday) {
                isAllowed = false;
                message = "Siz kun ora keladigan a'zosiz (Kecha kelgansiz)";
            }
        }
    }

    // Check if already checked in today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            memberId: member.id,
            checkIn: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });

    if (existingAttendance) {
        return { success: false, message: "QR kod bir kunda birmarta ishlaydi", member };
    }

    if (!isAllowed) {
        return { success: false, message: "Kirish Taqiqlanadi: " + message, member };
    }

    // CREATE ATTENDANCE RECORD
    const attendance = await prisma.attendance.create({
        data: {
            memberId: member.id,
            checkIn: new Date()
        }
    });

    // Webhook: Member Check-in
    await sendWebhook("MEMBER_CHECKIN", {
        memberId: member.id,
        memberName: member.fullName,
        checkInTime: attendance.checkIn,
        plan: member.subscriptions[0]?.plan || "Obunasiz"
    });

    return { success: true, message: "Xush kelibsiz!", member, checkIn: attendance.checkIn };
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

// --- STATS ACTIONS ---

export async function getDailyStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const subscriptions = await prisma.subscription.findMany({
        where: {
            startDate: {
                gte: today,
                lt: tomorrow
            }
        },
        include: {
            member: {
                select: {
                    fullName: true,
                    imageUrl: true
                }
            }
        }
    });

    // Count daily visits
    const visitsCount = await prisma.attendance.count({
        where: {
            checkIn: {
                gte: today,
                lt: tomorrow
            }
        }
    });

    const totalRevenue = subscriptions.reduce((acc, sub) => acc + sub.price, 0);

    // Recent visits (latest 10)
    const recentVisits = await prisma.attendance.findMany({
        take: 10,
        orderBy: { checkIn: 'desc' },
        include: {
            member: {
                select: {
                    fullName: true,
                    imageUrl: true,
                    subscriptions: {
                        orderBy: { endDate: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    // Monthly visits count
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyVisits = await prisma.attendance.count({
        where: {
            checkIn: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    return {
        revenue: totalRevenue,
        visitsCount: visitsCount,
        monthlyVisits: monthlyVisits,
        recentVisits: recentVisits.map(visit => ({
            id: visit.id,
            member: visit.member.fullName,
            image: visit.member.imageUrl,
            checkIn: visit.checkIn,
            plan: visit.member.subscriptions[0]?.plan || 'Obunasiz'
        })),
        transactions: subscriptions.map(sub => ({
            id: sub.id,
            member: sub.member.fullName,
            image: sub.member.imageUrl,
            amount: sub.price,
            plan: sub.plan,
            date: sub.startDate
        }))
    };
}
