import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OutcomeController } from "./outcome.controller";
import { OutcomeService } from "./outcome.service";

@Module({
    imports: [AuthModule], 
    providers: [OutcomeService], 
    controllers: [OutcomeController]
}) 
export class OutcomeModule {} 