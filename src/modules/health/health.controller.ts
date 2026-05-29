import { Controller, Get } from "@nestjs/common";

@Controller("/health")
export class HealthController 
{
    @Get("liveness") 
    async checkAppHealth() 
    {
        return "Your app is running. Build with Cloudian 💙 Cloud"
    }
}