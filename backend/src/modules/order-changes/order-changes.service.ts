import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrderChangeRequest,
  Order,
  MitraProfile,
  ChangeRequestStatus,
  OrderStatus,
} from '../../database/entities/entities';

@Injectable()
export class OrderChangesService {
  constructor(
    @InjectRepository(OrderChangeRequest)
    private readonly ocrRepo: Repository<OrderChangeRequest>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(MitraProfile)
    private readonly mitraRepo: Repository<MitraProfile>,
  ) {}

  async createRequest(userId: number, dto: { orderId: number; reason: string }) {
    const mitra = await this.mitraRepo.findOne({ where: { user: { id: userId } } });
    if (!mitra) throw new NotFoundException('Mitra profile tidak ditemukan');

    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const request = this.ocrRepo.create({
      order,
      technician: mitra,
      reason: dto.reason,
      status: ChangeRequestStatus.WAITING,
    });

    const saved = await this.ocrRepo.save(request);
    order.status = OrderStatus.WAITING_APPROVAL;
    await this.orderRepo.save(order);

    return saved;
  }

  async respondRequest(id: number, status: ChangeRequestStatus) {
    const request = await this.ocrRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!request) throw new NotFoundException('Change request tidak ditemukan');

    request.status = status;
    if (status === ChangeRequestStatus.APPROVED) {
      request.order.status = OrderStatus.IN_PROGRESS;
    } else {
      request.order.status = OrderStatus.IN_PROGRESS;
    }
    await this.orderRepo.save(request.order);
    return this.ocrRepo.save(request);
  }
}
