import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from '../entities/district.entity';
import { School } from '../entities/school.entity';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
  ) {}

  async findAll(): Promise<District[]> {
    return this.districtRepo.find({ order: { name: 'ASC' } });
  }

  async findSchoolsByDistrict(districtId: string): Promise<School[]> {
    const district = await this.districtRepo.findOne({ where: { id: districtId } });
    if (!district) throw new NotFoundException('District not found');
    return this.schoolRepo.find({
      where: { districtId },
      order: { name: 'ASC' },
    });
  }
}
