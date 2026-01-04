import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        this.supabase = createClient(
            this.configService.get('SUPABASE_URL'),
            this.configService.get('SUPABASE_KEY'),
        );
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'posts') {
        const timestamp = Date.now();
        const fileName = `${folder}/${timestamp}_${file.originalname}`;

        const { data, error } = await this.supabase.storage
            .from(this.configService.get('SUPABASE_BUCKET') || 'images')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw error;
        }

        const { data: { publicUrl } } = this.supabase.storage
            .from(this.configService.get('SUPABASE_BUCKET') || 'images')
            .getPublicUrl(fileName);

        return publicUrl;
    }
}
