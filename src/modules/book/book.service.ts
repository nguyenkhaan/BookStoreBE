import { ResponseBody } from '@/bases/commons/enums/response.enum';
import { MinioService } from '@/minio/minio.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateBookData, UpdateBookData } from './dto/book.dto';
import type { Express } from 'express';
import convertExcelToJson from '@/utlitis/excelToJson';
import { UploadBookService } from './helpers/book.upload';
import { BookCategory } from '@prisma/client';
// import { STOCK_IMPORT_NUMBER_MIN } from '@/bases/commons/constants/app.constant';
@Injectable()
export class BookService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly minioService: MinioService,
	) {}
	private async findPublisherById(id: number) {
		try {
			const publisher = await this.prismaService.publisher.findFirst({
				where: {
					id,
				},
				select: {
					name: true,
				},
			});
			return publisher;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	private async findAuthorById(id: number) {
		try {
			const publisher = await this.prismaService.author.findFirst({
				where: {
					id,
				},
				select: {
					name: true,
				},
			});
			return publisher;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async getAllBooks() {
		try {
			let books = await this.prismaService.book.findMany({
				where: {
					deletedAt: null,
				},
			});
			const booksWithUrl = await Promise.all(
				books.map(async (book) => {
					if (book.coverImage) {
						const url = await this.minioService.getFileUrl(
							book.coverImage,
						);
						return {
							...book,
							coverImage: url,
						};
					}
					return book;
				}),
			);
			return booksWithUrl;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async getBookById(bookId: number) {
		try {
			const book = await this.prismaService.book.findFirst({
				where: { id: bookId },
			});
			if (!book)
				return {
					[ResponseBody.ERROR]: 0,
					[ResponseBody.MESSAGE]: 'Book Not Found',
				};
			return book;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async getBookByCode(code: string) {
		try {
			const book = await this.prismaService.book.findFirst({
				where: { code },
			});
			return book;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async createBook(
		createBookData: CreateBookData,
		file: Express.Multer.File,
	) {
		try {
			const authors = await this.prismaService.author.findMany({
				where: {
					id: { in: createBookData.authorIds },
				},
				select: { id: true },
			});

			if (authors.length !== createBookData.authorIds.length)
				return {
					[ResponseBody.ERROR]: 5,
					[ResponseBody.MESSAGE]: 'Author Not Found',
				};

			const publishers = await this.prismaService.publisher.findMany({
				where: {
					id: { in: createBookData.publisherIds },
				},
				select: { id: true },
			});

			if (publishers.length !== createBookData.publisherIds.length)
				return {
					[ResponseBody.ERROR]: 5,
					[ResponseBody.MESSAGE]: 'Publisher Not Found',
				};

			let fileName: string | null = null;

			if (file) {
				fileName = await this.minioService.uploadFile(file);
			}

			const book = await this.prismaService.book.create({
				data: {
					title: createBookData.title,
					category: createBookData.category || BookCategory.GIAO_DUC,
					cost: createBookData.cost,
					code: createBookData.code,
					year: createBookData.year,
					coverImage: fileName,
					authors: {
						create: createBookData.authorIds.map((id) => ({
							author: { connect: { id } },
						})),
					},

					publishers: {
						create: createBookData.publisherIds.map((id) => ({
							publisher: { connect: { id } },
						})),
					},

					inventory:
						createBookData.stock !== undefined
							? {
									create: {
										stock: createBookData.stock,
									},
								}
							: undefined,
				},
			});

			return book;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async updateBookById(
		id: number,
		updateBook: UpdateBookData,
		file: Express.Multer.File,
	) {
		try {
			const book = await this.prismaService.book.findFirst({
				where: {
					id,
					deletedAt: null,
				},
			});

			if (!book)
				return {
					[ResponseBody.ERROR]: 5,
					[ResponseBody.MESSAGE]: 'Book Not Found',
				};

			if (updateBook.authorIds) {
				const authors = await this.prismaService.author.findMany({
					where: { id: { in: updateBook.authorIds } },
				});

				if (authors.length !== updateBook.authorIds.length)
					return {
						[ResponseBody.ERROR]: 5,
						[ResponseBody.MESSAGE]: 'Author Not Found',
					};
			}

			if (updateBook.publisherIds) {
				const publishers = await this.prismaService.publisher.findMany({
					where: { id: { in: updateBook.publisherIds } },
				});

				if (publishers.length !== updateBook.publisherIds.length)
					return {
						[ResponseBody.ERROR]: 5,
						[ResponseBody.MESSAGE]: 'Publisher Not Found',
					};
			}

			let fileName = book.coverImage;

			if (file) {
				if (book.coverImage) {
					await this.minioService.deleteFile(book.coverImage);
				}

				fileName = await this.minioService.uploadFile(file);
			}

			const updatedBook = await this.prismaService.book.update({
				where: { id },
				data: {
					...(updateBook.title && {
						title: updateBook.title,
					}),
					...(updateBook.cost && {
						title: updateBook.title,
					}),
					...(updateBook.category && {
						title: updateBook.category,
					}),
					coverImage: fileName,

					...(updateBook.authorIds && {
						authors: {
							deleteMany: {},
							create: updateBook.authorIds.map((id) => ({
								author: { connect: { id } },
							})),
						},
					}),

					...(updateBook.publisherIds && {
						publishers: {
							deleteMany: {},
							create: updateBook.publisherIds.map((id) => ({
								publisher: { connect: { id } },
							})),
						},
					}),
				},
			});

			if (updateBook.stock !== undefined) {
				await this.prismaService.inventory.upsert({
					where: { bookId: id },
					update: { stock: updateBook.stock },
					create: {
						bookId: id,
						stock: updateBook.stock,
					},
				});
			}

			return updatedBook;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async deleteBookById(id: number) {
		//soft: delete
		try {
			const book = await this.prismaService.book.findFirst({
				where: {
					id,
					deletedAt: null,
				},
			});

			if (!book)
				return {
					[ResponseBody.ERROR]: 5,
					[ResponseBody.MESSAGE]: 'Book Not Found',
				};

			await this.prismaService.book.update({
				where: { id },
				data: {
					deletedAt: new Date(),
				},
			});

			return {
				[ResponseBody.ERROR]: 0,
				[ResponseBody.MESSAGE]: 'Delete Book Successfully',
			};
		} catch (err) {
			console.log(err);
			throw err;
		}
	}
	async statisticBook() {
		try {
			const totalBookTitle = await this.prismaService.book.count({
				where: {
					deletedAt: null,
				},
			});

			const totalQuantity = await this.prismaService.inventory.aggregate({
				where: {
					book: {
						deletedAt: null,
					},
				},
				_sum: {
					stock: true,
				},
			});

			const results = await this.prismaService.$queryRaw<
				{ total: number }[]
			>`
                SELECT SUM(b.cost * i.stock) as total
                FROM "Book" b
                JOIN "Inventory" i ON b.id = i."bookId"
                WHERE b."deletedAt" IS NULL
                `;
			const totalStockValue = results[0].total ?? 0;
			//Tinh so luong sach sap het hang
			const outOfStocks = await this.prismaService.inventory.count({
				where: {
					book: {
						deletedAt: null,
					},
					stock: {
						lt: 50, //Dua ra cac cuon sach co so luong duoi 50 cuon
						gt: 0,
					},
				},
			});
			return {
				totalBookTitle,
				totalQuantity: totalQuantity._sum.stock,
				totalStockValue,
				outOfStocks,
			};
		} catch (err) {
			console.log('Book Statistic Error: ', err);
			throw err;
		}
	}
	async uploadBookData(file: Express.Multer.File) {
		try {
			const buffer = file.buffer;
			const jsonData = await convertExcelToJson(buffer);
			const uploadBookMappingData =
				UploadBookService.mapUploadData(jsonData);

			await this.prismaService.$transaction(async (tx) => {
				//filter row with the inventory > 150
				const validRows = uploadBookMappingData.filter(
					(row: any) => row.stock >= 150,
				);

				if (validRows.length === 0) return;

				//Find the exsitsting books
				const existingBooks = await tx.book.findMany({
					where: {
						code: {
							in: validRows.map((x: any) => x.code),
						},
					},
				});

				const bookMap = new Map(existingBooks.map((b) => [b.code, b]));

				const newBooksData: any[] = [];
				const authorBookData: any[] = [];
				const publisherBookData: any[] = [];

				for (const row of validRows) {
					const existingBook = bookMap.get(row.code);

					if (existingBook) {
						const inventory = await tx.inventory.findFirst({ where : { bookId : existingBook.id } , select : { stock : true } }) 
						if (Number(inventory?.stock ?? 0) >= 300) //Chi nhap cho nhung cuon sach co so luong ton kho < 300
							continue
						await tx.inventory.upsert({
							where: { bookId: existingBook.id },
							update: {
								stock: {
									increment: row.stock,
								},
							},
							create: {
								bookId: existingBook.id,
								stock: row.stock,
							},
						});
					} else {
						newBooksData.push({
							code: row.code,
							coverImage: row.coverImage,
							title: row.title,
							cost: row.cost,
							year: row.year,
						});
					}
				}

				if (newBooksData.length > 0) {
					await tx.book.createMany({
						data: newBooksData,
					});

					const newBooks = await tx.book.findMany({
						where: {
							code: {
								in: newBooksData.map((x) => x.code),
							},
						},
					});

					const newBookMap = new Map(
						newBooks.map((b) => [b.code, b]),
					);

					const inventoryData: any[] = [];

					for (const row of validRows) {
						const book = newBookMap.get(row.code);
						if (!book) continue;
						
						for (const authorId of row.authorIds) {
							authorBookData.push({
								authorId,
								bookId: book.id,
							});
						}

						for (const publisherId of row.publisherIds) {
							publisherBookData.push({
								publisherId,
								bookId: book.id,
							});
						}

						inventoryData.push({
							bookId: book.id,
							stock: row.stock,
						});
					}

					await tx.authorBook.createMany({
						data: authorBookData,
						skipDuplicates: true,
					});

					await tx.publisherBook.createMany({
						data: publisherBookData,
						skipDuplicates: true,
					});

					await tx.inventory.createMany({
						data: inventoryData,
					});
				}
			});

			return {
				[ResponseBody.ERROR]: 0,
				[ResponseBody.MESSAGE]: 'Insert/update book successfully',
			};
		} catch (err) {
			console.log('Error', err);
			throw err;
		}
	}
}
