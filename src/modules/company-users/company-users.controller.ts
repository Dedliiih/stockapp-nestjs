import { Controller, Get, Param, Patch, Req, UseGuards, Body } from '@nestjs/common';
import { CompanyUsersService } from './company-users.service';
import { AuthGuard } from '@guards/auth.guard';
import { RolesGuard } from '@guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('company-users')
export class CompanyUsersController {
  constructor(private readonly companyUsersService: CompanyUsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Ceo, Role.StockController)
  @Get()
  async getCompanyUsers(@Req() req: any) {
    return await this.companyUsersService.getCompanyUsers(req.user.company);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Ceo, Role.Admin)
  @Patch(':id')
  async deleteCompanyUser(@Param('id') userId: string) {
    await this.companyUsersService.deleteCompanyUser(userId);
    return { message: 'Usuario eliminado con éxito' };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Ceo)
  @Patch(':id/role')
  async updateCompanyUserRole(@Param('id') userId: string, @Body('roleId') roleId: string) {
    await this.companyUsersService.updateCompanyUserRole(userId, roleId);
    return { message: 'Rol modificado con éxito' };
  }
}
