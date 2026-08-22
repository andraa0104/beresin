import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, Role, UserRole, CustomerProfile, UserStatus } from '../../database/entities/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepo: Repository<CustomerProfile>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: { name: string; phone: string; email?: string; password: string }) {
    if (!dto.name || !dto.phone || !dto.password) {
      throw new BadRequestException('Nama, nomor telepon, dan password wajib diisi');
    }
    const existingPhone = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (existingPhone) {
      throw new BadRequestException('Nomor telepon sudah terdaftar');
    }
    if (dto.email) {
      const existingEmail = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existingEmail) {
        throw new BadRequestException('Email sudah terdaftar');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      uuid: uuidv4(),
      name: dto.name,
      phone: dto.phone,
      email: dto.email || null,
      passwordHash,
      status: UserStatus.ACTIVE,
    });
    const savedUser = await this.userRepo.save(user);

    // Default assign role 'CUSTOMER'
    let customerRole = await this.roleRepo.findOne({ where: { name: 'CUSTOMER' } });
    if (!customerRole) {
      customerRole = await this.roleRepo.save({
        name: 'CUSTOMER',
        description: 'Default Customer Role',
      });
    }

    await this.userRoleRepo.save({
      user: savedUser,
      role: customerRole,
    });

    // Create Customer Profile
    const customerCode = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
    await this.customerProfileRepo.save({
      user: savedUser,
      customerCode,
      totalTransaction: 0,
      totalSpending: 0,
    });

    const token = this.generateToken(savedUser, ['CUSTOMER']);
    return {
      user: {
        id: savedUser.id,
        uuid: savedUser.uuid,
        name: savedUser.name,
        phone: savedUser.phone,
        email: savedUser.email,
        roles: ['CUSTOMER'],
      },
      token,
    };
  }

  async login(dto: { phoneOrEmail?: string; phone?: string; email?: string; password: string }) {
    const identifier = dto.phoneOrEmail || dto.phone || dto.email;
    if (!identifier) {
      throw new BadRequestException('Nomor telepon atau email wajib diisi');
    }
    if (!dto.password) {
      throw new BadRequestException('Password wajib diisi');
    }

    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('user.phone = :identifier OR user.email = :identifier', {
        identifier,
      })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    const roles = user.userRoles ? user.userRoles.map((ur) => ur.role.name) : ['CUSTOMER'];
    const token = this.generateToken(user, roles);

    return {
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        phone: user.phone,
        email: user.email,
        status: user.status,
        roles,
      },
      token,
    };
  }

  private generateToken(user: User, roles: string[]) {
    const payload = {
      sub: user.id,
      uuid: user.uuid,
      name: user.name,
      phone: user.phone,
      email: user.email,
      roles,
    };
    return this.jwtService.sign(payload);
  }
}
