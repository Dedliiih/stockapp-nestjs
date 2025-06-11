import { Controller, Post, Body, Req, UseGuards, Patch, Delete } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompaniesService } from './companies.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthService } from '../auth/auth.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly authService: AuthService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createCompany(@Body() createCompanyDto: CreateCompanyDto, @Req() req: any) {
    const ownerId: string = req.user.userId;
    await this.companiesService.createCompany(ownerId, createCompanyDto);
    const newToken = await this.authService.updateToken(req.user.userId);
    return { message: 'Compañía creada con éxito', token: newToken };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Ceo)
  @Delete()
  async deleteCompany(@Req() req: any) {
    const companyId: string = req.user.company;
    await this.companiesService.deleteCompany(companyId);
    const newToken = await this.authService.updateToken(req.user.userId);
    return { message: 'Compañia eliminada con éxito', token: newToken };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Ceo)
  @Patch()
  async updateCompany(@Body() companyData: UpdateCompanyDto, @Req() req: any) {
    const companyId: string = req.user.company;
    await this.companiesService.updateCompany(companyId, companyData);
    return { message: 'Compañía actualizada con éxito' };
  }
}
