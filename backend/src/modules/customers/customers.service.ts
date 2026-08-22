import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile, Location } from '../../database/entities/entities';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  async findAll() {
    const list = await this.customerRepo.find({
      relations: ['user', 'locations'],
    });
    return list.map((c) => ({
      ...c,
      isNewCustomer: Number(c.totalTransaction) === 0,
      classification: Number(c.totalTransaction) === 0 ? 'NEW_USER' : 'EXISTING_USER',
    }));
  }

  async findByUserId(userId: number) {
    const profile = await this.customerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'locations', 'orders'],
    });
    if (!profile) throw new NotFoundException('Customer profile tidak ditemukan');
    return {
      ...profile,
      isNewCustomer: Number(profile.totalTransaction) === 0,
      classification: Number(profile.totalTransaction) === 0 ? 'NEW_USER' : 'EXISTING_USER',
    };
  }

  async addLocation(
    userId: number,
    dto: { address: string; latitude?: number; longitude?: number; notes?: string },
  ) {
    const profile = await this.findByUserId(userId);
    const location = this.locationRepo.create({
      customer: { id: profile.id } as any,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
      notes: dto.notes,
    });
    return this.locationRepo.save(location);
  }
}
