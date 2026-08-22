import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../database/entities/entities';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll() {
    return this.roleRepo.find();
  }

  async create(dto: { name: string; description?: string }) {
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }
}
