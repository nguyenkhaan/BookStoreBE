import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { VoucherType } from "@prisma/client";
import { CreateBillData } from "./dto/bill.dto";

@Injectable() 
export class BillService 
{
    constructor(
        private readonly prismaService : PrismaService 

    ) {}  
    async getAllBills() 
    {
        try 
        {
            const bills = await this.prismaService.bill.findMany({
                include: {
                    billDetail : {
                        include: { book : true }
                    }, 
                    voucherUsage: {
                        include: { voucher : true }
                    }
                }, 
            }) 
            const result = bills.map((bill) => {
                let total = bill.billDetail.reduce((sum, item) => {
                    return sum + item.quantity * Number(item.book.cost)
                }, 0)
                for(const v of bill.voucherUsage) 
                {
                    const voucher = v.voucher 
                    if (voucher.type == VoucherType.PERCENT) 
                        total = Math.max(0 , total - total *Number(voucher.sale) / 100) 
                    else 
                        total = Math.max(0 , total - Number(voucher.sale)) 
                    return {
                        ...bill, 
                        totalCost: total 
                    }
                }
            })
            return result  

        } 
        catch (err) 
        {
            console.log("Get All Bills Error: " , err) 
            throw err 
        } 
    } 
    async createBill(createBillData : CreateBillData) 
    {
        try 
        {
            const bill = await this.prismaService.bill.create({
                data: {
                    code : createBillData.code, 
                    customerId : createBillData.customerId, 
                    temporaryCost : createBillData.temporaryCost || 0, 
                    status : createBillData.status,  
                }
            })
            const voucherUsageData = [] 
            const billDetailData = [] 
            if (createBillData.vouchers) 
            {
                for (const v of createBillData.vouchers) 
                {
                    voucherUsageData.push({
                        billId : bill.id, 
                        voucherId : v.voucherId 
                    })
                }
                await this.prismaService.voucherUsage.createMany({
                    data : voucherUsageData 
                })
            }
            if (createBillData.billDetails) 
            {
                for(const b of createBillData.billDetails) 
                {
                    billDetailData.push({
                        quantity : b.quantity, 
                        bookId : b.bookId, 
                        billId : bill.id 
                    })
                }
                await this.prismaService.billDetail.createMany({
                    data : billDetailData 
                }) 
            }
            return {
                bill, 
                voucherUsage : voucherUsageData, 
                billDetail : billDetailData 
            }
        } 
        catch (err) 
        {
            console.log("Create Bill Error") , err 
            throw err 
        }
    }
}