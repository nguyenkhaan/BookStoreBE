import { PrismaService } from '@/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { CreateVoucherData, UpdateVoucherData } from './dto/voucher.dto'
import { VoucherStatus } from '@prisma/client'

@Injectable()
export class VoucherService {

  constructor(
    private readonly prismaService: PrismaService
  ) {}

  async getAllVouchers() {
    try {

      const vouchers = await this.prismaService.voucher.findMany({
        where: { deletedAt: null }
      })

      return vouchers

    } catch (err) {

      console.log("Get All Vouchers Error:", err)
      throw err

    }
  }
  async getVoucherCanUse() {
    try {
        const vouchers = await this.prismaService.voucher.findMany({
            where: {
                deletedAt: null, 
                quantity: {
                    gt: 0 
                }, 
                status: VoucherStatus.APPLYING 
            }
        })
        return vouchers 
    } 
    catch (err) 
    {
        console.log("Get Vouchers In Use Error: " , err) 
        throw err 
    }
  }
  async getVoucherById(id: number) {
    try {

      const voucher = await this.prismaService.voucher.findUnique({
        where: { id }
      })

      return voucher

    } catch (err) {

      console.log("Get Voucher By Id Error:", err)
      throw err

    }
  }

  async createVoucher(createVoucherData: CreateVoucherData) {
    try {

      const voucher = await this.prismaService.voucher.create({
        data: {
          name: createVoucherData.name,
          eventName: createVoucherData.eventName,
          sale: createVoucherData.sale,
          status: createVoucherData.status,
          quantity: createVoucherData.quantity,
          usedNumber: 0,
          expiresAt: new Date(createVoucherData.expiresAt),
          type: createVoucherData.type
        }
      })

      return voucher

    } catch (err) {

      console.log("Create Voucher Error:", err)
      throw err

    }
  }

  async updateVoucher(id: number, updateVoucherData: UpdateVoucherData) {
    try {

      const voucher = await this.prismaService.voucher.update({
        where: { id },
        data: {
          ...updateVoucherData,
          expiresAt: updateVoucherData.expiresAt
            ? new Date(updateVoucherData.expiresAt)
            : undefined
        }
      })

      return voucher

    } catch (err) {

      console.log("Update Voucher Error:", err)
      throw err

    }
  }

  async deleteVoucher(id: number) {
    try {

      const voucher = await this.prismaService.voucher.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      })

      return voucher

    } catch (err) {

      console.log("Delete Voucher Error:", err)
      throw err

    }
  }

  async getVoucherUsages(voucherId: number) {
    try {

      const usages = await this.prismaService.voucherUsage.findMany({
        where: {
          voucherId
        },
        include: {
          bill: true
        }
      })

      return usages

    } catch (err) {

      console.log("Get Voucher Usage Error:", err)
      throw err

    }
  }
}