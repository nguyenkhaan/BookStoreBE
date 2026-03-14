import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOutcomeData } from './dto/outcome.dto';

@Injectable()
export class OutcomeService {
	constructor(private readonly prismaService: PrismaService) {}
	async getAllOutcome() {
		try {
			const outcomeBills = await this.prismaService.billOutcome.findMany({
                where: { deletedAt : null }, 
				select: {
					id: true,
					code: true,
					cost: true,
					status: true,
					createdAt: true,
					publisher: {
						select: {
							name: true,
						},
					},
					creator: {
						select: {
							name: true,
						},
					},
				},
			});
			return outcomeBills;
		} catch (err) {
			console.log('Get All Outcome Bills Password', err);
			throw err;
		}
	}
	async getOutcomeById(id: number) {
		try {
			const outcomeBill = await this.prismaService.billOutcome.findFirst({
				where: {
					id,
                    deletedAt : null 
				},
				select: {
					id: true,
					code: true,
					cost: true,
					status: true,
					createdAt: true,
					publisher: {
						select: {
							name: true,
						},
					},
					creator: {
						select: {
							name: true,
						},
					},
				},
			});
			if (!outcomeBill)
				throw new NotFoundException('Bill Outcome Not Found');
			return outcomeBill;
		} catch (err) {
			console.log('Get Outcome By Id', err);
			throw err;
		}
	}
	async getOutcomeByCode(code: string) {
		try {
			const outcomeBill = await this.prismaService.billOutcome.findFirst({
				where: {
					code,
                    deletedAt : null 
				},
				select: {
					id: true,
					code: true,
					cost: true,
					status: true,
					createdAt: true,
					publisher: {
						select: {
							name: true,
						},
					},
					creator: {
						select: {
							name: true,
						},
					},
				},
			});
			if (!outcomeBill)
				throw new NotFoundException('Bill Outcome Not Found');
			return outcomeBill;
		} catch (err) {
			console.log('Get Outcome By Id', err);
			throw err;
		}
	}
    async createOutcomeBill(creatorId : number , createOutcomeData : CreateOutcomeData) 
    {
        try 
        {
                await this.prismaService.$transaction(async (tx) => {
                const res = await tx.billOutcome.create({
                    data: {
                        code : createOutcomeData.code, 
                        cost : createOutcomeData.cost, 
                        status : createOutcomeData.status, 
                        quantity : createOutcomeData.quantity, 
                        publisherId : createOutcomeData.publisherId, 
                        employeeId : creatorId, 
                        bookId : createOutcomeData.bookId
                    }
                })
                //Tang so luong stock len 
                await tx.inventory.update({
                    where: {
                        bookId : createOutcomeData.bookId
                    }, 
                    data: {
                        stock : {
                            increment: createOutcomeData.quantity
                        }
                    }
                })
                return res 

            })
        } 
        catch (err) 
        {
            console.log("Create Outcome Error: " , err) 
            throw err 
        }
    }
}
