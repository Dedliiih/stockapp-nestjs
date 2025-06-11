import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsParamsDto } from './dto/get-products-pams.dto';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ProductDto } from './dto/product.dto';
import { TransformResponse } from 'src/common/decorators/transform-response.decorator';
import { PaginatedServiceResponse } from 'src/common/interceptors/transform-response.interceptor';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Ceo, Role.StockController, Role.Admin)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Req() req: { user?: { companyId: string } },
    @Body() createProductDto: CreateProductDto
  ): Promise<{ message: string }> {
    const companyId: string = req.user.companyId;
    createProductDto.company = companyId;
    await this.productsService.create(createProductDto);
    return { message: 'Producto añadido correctamente.' };
  }

  @Get()
  @TransformResponse(ProductDto, 'products')
  async findAll(
    @Req() req: { user?: { companyId: string } },
    @Query() params: GetProductsParamsDto
  ): Promise<PaginatedServiceResponse> {
    const companyId: string = req.user.companyId;
    return await this.productsService.getProducts(companyId, params);
  }

  @Get('/search')
  @TransformResponse(ProductDto, 'products')
  async findBySearchBar(
    @Req() req: { user?: { companyId: string } },
    @Query() params: GetProductsParamsDto
  ): Promise<PaginatedServiceResponse> {
    const companyId: string = req.user.companyId;
    return await this.productsService.findBySearchBar(companyId, params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Req() req: { user?: { companyId: string } },
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<{ message: string }> {
    const companyId: string = req.user.companyId;
    await this.productsService.update(productId, updateProductDto, companyId);
    return { message: 'Producto actualizado correctamente.' };
  }

  @Delete(':id')
  async remove(
    @Req() req: { user?: { companyId: string } },
    @Param('id') productId: string
  ): Promise<{ message: string }> {
    const companyId: string = req.user.companyId;
    await this.productsService.remove(productId, companyId);
    return { message: 'Producto eliminado.' };
  }
}
