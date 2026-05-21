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
import { RolesGuard } from '@/bases/guards/role.guard';

@Controller('book')
export class BookController {
	constructor(private readonly bookService: BookService) {}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get()
	async getAllBooks() {
		const books = await this.bookService.getAllBooks();
		return books;
	}
	@Post()
	@UseInterceptors(FileInterceptor('coverImage'))
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async createBook(
		@Body() createBookData: CreateBookData,
		@UploadedFile() file: any,
	) {
		const responseData = await this.bookService.createBook(
			createBookData,
			file,
		);
		return responseData;
	}

	@UseInterceptors(FileInterceptor('data'))
	@Post('/upload')
	async uploadBookExcels(@UploadedFile() file: any) {
		const responseData = await this.bookService.uploadBookData(file);
		return responseData;
	}

	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/statistic')
	async statisticBookInformation() {
		console.log('Running');
		//Thong ke tong so luong dau sach, tong so tien sach,...
		const responseData = await this.bookService.statisticBook();
		return responseData;
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/code/:code')
	async getBookByCode(@Param('code') code: string) {
		//Them sua sach
		const responseData = await this.bookService.getBookByCode(code);
		return responseData;
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Get('/:bookId')
	async getBookById(@Param('bookId', ParseIntPipe) bookId: number) {
		const responseData = await this.bookService.getBookById(Number(bookId));
		return responseData;
	}
	@Roles(Role.ADMIN) 
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Put('/:bookId')
	@UseInterceptors(FileInterceptor('coverImage'))
	async updateBook(
		@Body() updateBookData: UpdateBookData,
		@UploadedFile() file: any,
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
	@Roles(Role.ADMIN)
	@UseGuards(JwtAuthGuard)
	async deleteBook(@Param('bookId', ParseIntPipe) bookId: number) {
		const responseData = await this.bookService.deleteBookById(bookId);
		return responseData;
	}
	@Roles(Role.EMPLOYEE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async getGeneralStatistic() {
		return await this.bookService.statisticBook();
	}
}
