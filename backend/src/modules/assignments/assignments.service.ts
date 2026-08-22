import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TechnicianAssignment,
  Order,
  MitraProfile,
  User,
  AssignmentStatus,
  OrderStatus,
} from '../../database/entities/entities';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(TechnicianAssignment)
    private readonly assignmentRepo: Repository<TechnicianAssignment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(MitraProfile)
    private readonly mitraRepo: Repository<MitraProfile>,
  ) {}

  async assignTechnician(orderId: number, mitraId: number, assignedByUserId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const mitra = await this.mitraRepo.findOne({ where: { id: mitraId } });
    if (!mitra) throw new NotFoundException('Mitra/Teknisi tidak ditemukan');

    const assignment = this.assignmentRepo.create({
      order,
      mitra,
      assignedBy: { id: assignedByUserId } as User,
      status: AssignmentStatus.PENDING,
    });

    const saved = await this.assignmentRepo.save(assignment);
    order.status = OrderStatus.ASSIGNED;
    await this.orderRepo.save(order);

    return saved;
  }

  async updateAssignmentStatus(id: number, status: AssignmentStatus) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!assignment) throw new NotFoundException('Assignment tidak ditemukan');

    assignment.status = status;
    if (status === AssignmentStatus.ACCEPTED) {
      assignment.order.status = OrderStatus.ACCEPTED;
      await this.orderRepo.save(assignment.order);
    }
    return this.assignmentRepo.save(assignment);
  }

  async findMitraJobs(userId: number) {
    const mitra = await this.mitraRepo.findOne({ where: { user: { id: userId } } });
    if (!mitra) return [];

    return this.assignmentRepo.find({
      where: { mitra: { id: mitra.id } },
      relations: ['order', 'order.customer', 'order.customer.user', 'order.service', 'order.items'],
      order: { assignedAt: 'DESC' },
    });
  }
}
