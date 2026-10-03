import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CommerceService } from './commerce.service';
import { CreateOrderDto, VerifyPaymentDto } from './dto/commerce.dto';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserPayload } from '@eduyug/shared-types';

@Controller('api/v1/commerce')
export class CommerceController {
  constructor(private readonly commerceService: CommerceService) {}

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async createOrder(@CurrentUser() user: UserPayload, @Body() dto: CreateOrderDto) {
    return this.commerceService.createOrder(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(@CurrentUser() user: UserPayload, @Body() dto: VerifyPaymentDto) {
    return this.commerceService.verifyPayment(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @Get('instructor/earnings')
  async getInstructorEarnings(@CurrentUser() user: UserPayload) {
    return this.commerceService.getInstructorEarnings(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(@CurrentUser() user: UserPayload) {
    return this.commerceService.getUserOrders(user.sub);
  }
}
