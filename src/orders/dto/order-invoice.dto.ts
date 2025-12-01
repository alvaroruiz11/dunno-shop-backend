import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from 'generated/prisma';

export class OrderInvoiceDto {
  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @IsString()
  @IsOptional()
  nitNumber?: string;

  @IsString()
  @IsOptional()
  socialReason?: string;
}
