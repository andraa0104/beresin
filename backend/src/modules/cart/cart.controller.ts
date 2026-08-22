import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import {
  AddCartItemDto,
  UpdateCartItemDto,
  RemoveCartItemDto,
  CalculateCartDirectDto,
} from './dto/cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Cart & Configuration')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ============================================================================
  // 1. GET TEMPORARY CART
  // ============================================================================

  @Get()
  @ApiOperation({
    summary:
      'Dapatkan isi keranjang sementara (Gunakan JWT auth untuk user login atau query ?sessionId=... untuk guest)',
  })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Guest Session ID' })
  @ApiResponse({ status: 200, description: 'Keranjang dan subtotal berhasil diambil' })
  async getCart(@Req() req: any, @Query('sessionId') sessionId?: string) {
    const userId = req.user?.userId;
    const cartKey = this.cartService.getCartKey(userId, sessionId);
    return this.cartService.getCart(cartKey);
  }

  // ============================================================================
  // 2. ADD ITEM TO CART (PRODUCT / ACCESSORY / SERVICE)
  // ============================================================================

  @Post('items')
  @ApiOperation({
    summary:
      'Tambahkan item ke keranjang (Mendukung tipe: PRODUCT, ACCESSORY, SERVICE)',
  })
  @ApiResponse({ status: 201, description: 'Item berhasil ditambahkan ke keranjang' })
  async addItem(@Req() req: any, @Body() dto: AddCartItemDto) {
    const userId = req.user?.userId;
    const cartKey = this.cartService.getCartKey(userId, dto.sessionId);
    return this.cartService.addItem(cartKey, dto);
  }

  // ============================================================================
  // 3. UPDATE ITEM QUANTITY
  // ============================================================================

  @Put('items')
  @ApiOperation({
    summary: 'Update kuantitas item di keranjang (Kuantitas 0 akan menghapus item)',
  })
  @ApiResponse({ status: 200, description: 'Kuantitas item berhasil diperbarui' })
  async updateItem(@Req() req: any, @Body() dto: UpdateCartItemDto) {
    const userId = req.user?.userId;
    const cartKey = this.cartService.getCartKey(userId, dto.sessionId);
    return this.cartService.updateItem(cartKey, dto);
  }

  // ============================================================================
  // 4. REMOVE ITEM FROM CART
  // ============================================================================

  @Delete('items')
  @ApiOperation({ summary: 'Hapus item spesifik dari keranjang' })
  @ApiResponse({ status: 200, description: 'Item berhasil dihapus dari keranjang' })
  async removeItem(@Req() req: any, @Body() dto: RemoveCartItemDto) {
    const userId = req.user?.userId;
    const cartKey = this.cartService.getCartKey(userId, dto.sessionId);
    return this.cartService.removeItem(cartKey, dto);
  }

  // ============================================================================
  // 5. CLEAR ALL CART
  // ============================================================================

  @Delete('clear')
  @ApiOperation({ summary: 'Kosongkan seluruh isi keranjang' })
  @ApiQuery({ name: 'sessionId', required: false })
  async clearCart(@Req() req: any, @Query('sessionId') sessionId?: string) {
    const userId = req.user?.userId;
    const cartKey = this.cartService.getCartKey(userId, sessionId);
    return this.cartService.clearCart(cartKey);
  }

  // ============================================================================
  // 6. CALCULATE ESTIMATED SUBTOTAL DIRECTLY
  // ============================================================================

  @Post('calculate')
  @ApiOperation({
    summary:
      'Hitung langsung estimasi subtotal konfigurasi pembelian (Service + Produk + Aksesoris)',
  })
  async calculate(@Body() dto: CalculateCartDirectDto) {
    return this.cartService.calculateCart({
      serviceId: dto.serviceId,
      servicePackageId: dto.servicePackageId,
      items: dto.items || [],
    });
  }
}
