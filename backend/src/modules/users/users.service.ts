import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, Role, UserStatus } from '../../database/entities/entities';

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

  async createUser(dto: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    role?: string;
    status?: UserStatus;
  }) {
    if (!dto.name || !dto.phone) {
      throw new NotFoundException('Nama dan nomor telepon wajib diisi');
    }
    const existing = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new NotFoundException('Nomor telepon sudah terdaftar');
    }
    if (dto.email) {
      const existingEmail = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existingEmail) {
        throw new NotFoundException('Email sudah terdaftar');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password || 'password123', salt);

    const user = this.userRepo.create({
      uuid: uuidv4(),
      name: dto.name,
      phone: dto.phone,
      email: dto.email || null,
      passwordHash,
      status: dto.status || UserStatus.ACTIVE,
    });
    const savedUser = await this.userRepo.save(user);

    const targetRoleName = dto.role || 'CUSTOMER';
    let role = await this.roleRepo.findOne({ where: { name: targetRoleName } });
    if (!role) {
      role = await this.roleRepo.save({
        name: targetRoleName,
        description: `Role ${targetRoleName}`,
      });
    }

    await this.userRoleRepo.save({
      user: savedUser,
      role,
    });

    return this.findById(savedUser.id);
  }

  async updateRoles(userId: number, roleNames: string[]) {
    const user = await this.findById(userId);
    // Hapus role lama user
    await this.userRoleRepo.delete({ user: { id: user.id } });

    for (const roleName of roleNames) {
      let role = await this.roleRepo.findOne({ where: { name: roleName } });
      if (!role) {
        role = await this.roleRepo.save({ name: roleName, description: `Role ${roleName}` });
      }
      await this.userRoleRepo.save({ user, role });
    }

    return this.findById(user.id);
  }

  async remove(id: number) {
    const user = await this.findById(id);
    await this.userRepo.softDelete(user.id);
    return { message: `User ${user.name} berhasil dinonaktifkan (soft-delete)` };
  }
}
