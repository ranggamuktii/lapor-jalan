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
        Schema::table('reports', function (Blueprint $table) {
            $table->enum('severity', ['rendah', 'sedang', 'parah', 'kritis', 'belum_dinilai'])->default('belum_dinilai')->after('status');
            $table->json('ai_tags')->nullable()->after('severity');
            $table->foreignId('is_duplicate_of')->nullable()->constrained('reports')->nullOnDelete()->after('ai_tags');
            $table->text('ai_summary')->nullable()->after('is_duplicate_of');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['is_duplicate_of']);
            $table->dropColumn(['severity', 'ai_tags', 'is_duplicate_of', 'ai_summary']);
        });
    }
};
