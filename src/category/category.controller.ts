import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PreAuth } from '../auth/decorators/pre-auth.decorator';

@ApiTags('category')
@ApiSecurity('access-token')
@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @PreAuth({ resource: 'category', scope: 'create' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @PreAuth({ resource: 'category', scope: 'reads' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @PreAuth({ resource: 'category', scope: 'read' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  @PreAuth({ resource: 'category', scope: 'update' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @PreAuth({ resource: 'category', scope: 'delete' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
