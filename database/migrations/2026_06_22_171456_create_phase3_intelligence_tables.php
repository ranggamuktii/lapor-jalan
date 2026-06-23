<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modul 3: Verifikasi Komunitas (Pengganti upvote biasa)
        Schema::create('report_confirmations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->string('device_hash');
            $table->timestamps();
        });

        // Modul 1 & 9: Skoring AI & Kesimpulan
        Schema::create('report_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->integer('severity_score')->default(0); // 0-100
            $table->text('ai_summary')->nullable();
            $table->string('duplicate_of')->nullable(); // Jika AI mendeteksi ini duplikat dari report_id lain
            $table->timestamps();
        });

        // Modul 6: Public Timeline
        Schema::create('report_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->string('status'); // e.g., 'dibuat', 'divalidasi', 'diproses', 'selesai'
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Modul 8: District Statistics
        Schema::create('district_statistics', function (Blueprint $table) {
            $table->id();
            $table->string('district_name')->unique();
            $table->integer('report_count')->default(0);
            $table->integer('resolved_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('district_statistics');
        Schema::dropIfExists('report_timelines');
        Schema::dropIfExists('report_scores');
        Schema::dropIfExists('report_confirmations');
    }
};
