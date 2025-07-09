import { Body, Controller, Post, Get } from '@nestjs/common';
import { CategoryService } from './category.service';
import { COMMON_API_URL } from 'src/config/endpoints/api';

//@ApiTags(SWAGGER_TAGS.CATEGORIES)
@Controller(COMMON_API_URL.CATEGORIES.GLOBAL_ROUTES)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getCategories() {
    return this.categoryService.getCategories();
  }
  //@Roles(KEYCLOAK_USERS_ROLES.ADMIN)
  @Post(COMMON_API_URL.CATEGORIES.ADD)
  async addCategory(@Body() data: string | string[]) {
    return this.categoryService.addCategory(data);
  }
}
