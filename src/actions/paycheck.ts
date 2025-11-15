'use server'

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getPaychecks(payload: Prisma.PayCheckFindManyArgs) {
    const paychecks = await prisma.payCheck.findMany(payload)
    return paychecks
}


export async function getPaycheck(payload: Prisma.PayCheckFindFirstArgs) {
    const paycheck = await prisma.payCheck.findFirst(payload)
    return paycheck
}

export async function createPaycheck(payload: Prisma.PayCheckCreateArgs) {
    await prisma.payCheck.create(payload)
}