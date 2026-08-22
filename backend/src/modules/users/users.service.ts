import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, Role } from '../../database/entities/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll() {
    return this.userRepo.find({
      relations: ['userRoles', 'userRoles.role', 'customerProfile', 'mitraProfile'],
      select: ['id', 'uuid', 'name', 'email', 'phone', 'status', 'lastLoginAt', 'createdAt'],
    });
  }

  async findById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role', 'customerProfile', 'mitraProfile'],
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async assignRole(userId: number, roleName: string) {
    const user = await this.findById(userId);
    const role = await this.roleRepo.findOne({ where: { name: roleName } });
    if (!role) throw new NotFoundException(`Role ${roleName} tidak ditemukan`);

    const existing = await this.userRoleRepo.findOne({
      where: { user: { id: user.id }, role: { id: role.id } },
    });
    if (!existing) {
      await this.userRoleRepo.save({ user, role });
    }
    return { message: `Role ${roleName} berhasil ditambahkan ke user ${user.name}` };
  }

  async remove(id: number) {
    const user = await this.findById(id);
    await this.userRepo.softDelete(user.id);
    return { message: `User ${user.name} berhasil dinonaktifkan (soft-delete)` };
  }
}
