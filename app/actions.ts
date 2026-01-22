"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { sendWebhook } from "./lib/webhook";

export async function getMembers(query: string = "", page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const whereCondition = {
        OR: [
            { fullName: { contains: query } },
            { email: { contains: query } },
        ],
    };

    const [members, totalCount] = await Promise.all([
        prisma.member.findMany({
            where: whereCondition,
            include: {
                subscriptions: {
                    orderBy: { endDate: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.member.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Dynamic Status Calculation
    const processedMembers = members.map((member: any) => {
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

    return {
        members: processedMembers,
        totalPages,
        currentPage: page,
        totalMembers: totalCount
    };
}

export async function createMember(formData: FormData) {
    try {
        const fullName = formData.get("fullName") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const imageUrl = formData.get("imageUrl") as string;

        // Subscription Data
        const plan = formData.get("plan") as string;

        // Validate Plan
        if (!plan) {
            return { success: false, message: "Tarif rejasini tanlash majburiy!" };
        }

        const price = parseFloat(formData.get("price") as string);
        const startDate = new Date(formData.get("startDate") as string || new Date());

        // Calculate End Date if missing (1 month)
        let endDate = new Date(formData.get("endDate") as string);
        if (isNaN(endDate.getTime())) {
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
        }

        if (!fullName || !phone) {
            return { success: false, message: "Ism va Telefon raqami majburiy!" };
        }

        // ... (duplicate check)

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

            // Always create subscription
            await tx.subscription.create({
                data: {
                    plan,
                    price,
                    startDate,
                    endDate,
                    memberId: member.id
                }
            });
        });

        // Webhook: New Member
        await sendWebhook("MEMBER_CREATED", {
            fullName,
            phone,
            plan: plan,
            price: price
        });

        revalidatePath("/");
        revalidatePath("/members");
        revalidatePath("/subscriptions");
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
                    const newPrice = plan === "HAR_KUNLIK" ? 550000 : 300000;
                    await tx.subscription.update({
                        where: { id: latestSub.id },
                        data: {
                            plan,
                            price: newPrice
                        }
                    });
                }
            }
        });

        revalidatePath("/");
        revalidatePath("/members");
        revalidatePath("/subscriptions");
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
        revalidatePath("/subscriptions");
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
    const formattedCheckIn = new Date(attendance.checkIn).toLocaleString("ru-RU", {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        timeZone: "Asia/Tashkent"
    });

    await sendWebhook("MEMBER_CHECKIN", {
        memberId: member.id,
        memberName: member.fullName,
        checkInTime: attendance.checkIn,
        formattedTime: formattedCheckIn, // NEW: Readable format
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

// --- REPORTING ACTIONS ---

export async function sendMonthlyReport() {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // 1. New Members Count
        const newMembersCount = await prisma.member.count({
            where: {
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        // 2. Total Revenue
        const revenueAgg = await prisma.subscription.aggregate({
            _sum: {
                price: true
            },
            where: {
                startDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });
        const totalRevenue = revenueAgg._sum.price || 0;

        // 3. New Subscriptions Count
        const newSubsCount = await prisma.subscription.count({
            where: {
                startDate: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        // 4. Monthly Visits
        const monthlyVisits = await prisma.attendance.count({
            where: {
                checkIn: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });

        // Format Month Name (e.g., "Yanvar 2026")
        const monthName = startOfMonth.toLocaleString('uz-UZ', { month: 'long', year: 'numeric' });

        // Webhook Payload
        await sendWebhook("MONTHLY_REPORT", {
            reportMonth: monthName,
            newMembers: newMembersCount,
            totalRevenue: totalRevenue,
            subscriptionCount: newSubsCount,
            totalVisits: monthlyVisits,
            reportDate: new Date().toLocaleString("ru-RU", { timeZone: "Asia/Tashkent" })
        });

        return { success: true, message: "Oylik hisobot Telegramga yuborildi!" };
    } catch (error: any) {
        console.error("REPORT ERROR:", error);
        return { success: false, message: "Hisobot yuborishda xatolik!" };
    }
}

// --- SUBSCRIPTION PAGE ACTIONS ---

export async function getAllSubscriptions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [subscriptions, totalCount] = await Promise.all([
        prisma.subscription.findMany({
            include: {
                member: {
                    select: {
                        fullName: true,
                        imageUrl: true,
                        status: true
                    }
                }
            },
            orderBy: {
                startDate: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.subscription.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const processedSubscriptions = subscriptions.map(sub => {
        const now = new Date();
        const endDate = new Date(sub.endDate);
        const isActive = endDate > now;

        return {
            id: sub.id,
            memberName: sub.member.fullName,
            memberImage: sub.member.imageUrl,
            plan: sub.plan,
            price: sub.price,
            status: isActive ? "ACTIVE" : "EXPIRED",
            startDate: sub.startDate,
            endDate: sub.endDate
        };
    });

    return {
        subscriptions: processedSubscriptions,
        totalPages,
        currentPage: page,
        totalSubscriptions: totalCount
    };
}
