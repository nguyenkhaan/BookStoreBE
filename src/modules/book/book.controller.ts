import { Roles } from '@/bases/decorators/role.decorators';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookService } from './book.service';
import { CreateBookData, UpdateBookData } from './dto/book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
@Controller('book')
export class BookController {
	constructor(private readonly bookService: BookService) {}
	@Get()
	async getAllBooks() {
		const books = await this.bookService.getAllBooks();
		return books;
	}
    @Get('/statistic')
	async statisticBookInformation() {
        console.log("Running") 
		//Thong ke tong so luong dau sach, tong so tien sach,...
		const responseData = await this.bookService.statisticBook();
		return responseData;
	}
	@Get('/:bookId')
	async getBookById(@Param('bookId', ParseIntPipe) bookId: number) {
		const responseData = await this.bookService.getBookById(Number(bookId));
		return responseData;
	}
	@Post()
	@UseInterceptors(FileInterceptor('coverImage'))
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard)
	async createBook(
		@Body() createBookData: CreateBookData,
		@UploadedFile() file: Express.Multer.File,
	) {
		const responseData = await this.bookService.createBook(
			createBookData,
			file,
		);
		return responseData;
	}
	@Put('/:bookId')
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard)
	async updateBook(
		@Body() updateBookData: UpdateBookData,
		@UploadedFile() file: Express.Multer.File,
		@Param('bookId', ParseIntPipe) bookId: number,
	) {
		const responseData = await this.bookService.updateBookById(
			Number(bookId),
			updateBookData,
			file,
		);
		return responseData;
	}
	@Delete('/:bookId')
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard)
	async deleteBook(@Param('bookId', ParseIntPipe) bookId: number) {
		const responseData = await this.bookService.deleteBookById(bookId);
		return responseData;
	}

}
